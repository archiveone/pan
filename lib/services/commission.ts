import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { Commission, Listing, ListingEnquiry } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class CommissionService {
  /**
   * Create a new commission record when an agent is selected
   */
  static async createCommission(
    inquiry: ListingEnquiry & { listing: Listing },
    agentId: string
  ): Promise<Commission> {
    const listingPrice = Number(inquiry.listing.price);
    const commissionRate = 0.05; // 5% commission
    const commissionAmount = listingPrice * commissionRate;

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return await prisma.commission.create({
      data: {
        amount: commissionAmount,
        dueDate,
        agentId,
        listingId: inquiry.listingId,
        inquiryId: inquiry.id,
      },
    });
  }

  /**
   * Process commission payment using Stripe
   */
  static async processPayment(commissionId: string): Promise<Commission> {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        agent: true,
        listing: true,
      },
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (!commission.agent.stripeAccountId) {
      throw new Error('Agent Stripe account not connected');
    }

    try {
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(commission.amount) * 100), // Convert to cents
        currency: 'gbp',
        payment_method_types: ['card'],
        transfer_data: {
          destination: commission.agent.stripeAccountId,
        },
        metadata: {
          commissionId: commission.id,
          listingId: commission.listingId,
          agentId: commission.agentId,
        },
      });

      // Update commission record
      return await prisma.commission.update({
        where: { id: commissionId },
        data: {
          status: 'PROCESSING',
          stripePaymentId: paymentIntent.id,
        },
      });
    } catch (error) {
      // Update commission status to failed
      await prisma.commission.update({
        where: { id: commissionId },
        data: {
          status: 'FAILED',
          notes: error instanceof Error ? error.message : 'Payment processing failed',
        },
      });
      throw error;
    }
  }

  /**
   * Handle successful payment webhook from Stripe
   */
  static async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<Commission> {
    const { commissionId } = paymentIntent.metadata;

    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        transactionRef: paymentIntent.id,
      },
    });
  }

  /**
   * Get commission summary for an agent
   */
  static async getAgentCommissionSummary(agentId: string) {
    const [pending, processing, paid, total] = await Promise.all([
      prisma.commission.count({
        where: {
          agentId,
          status: 'PENDING',
        },
      }),
      prisma.commission.count({
        where: {
          agentId,
          status: 'PROCESSING',
        },
      }),
      prisma.commission.count({
        where: {
          agentId,
          status: 'PAID',
        },
      }),
      prisma.commission.aggregate({
        where: {
          agentId,
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      pending,
      processing,
      paid,
      totalEarned: total._sum.amount || 0,
    };
  }

  /**
   * Get detailed commission history for an agent
   */
  static async getAgentCommissionHistory(
    agentId: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where: { agentId },
        include: {
          listing: {
            select: {
              title: true,
              price: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.commission.count({
        where: { agentId },
      }),
    ]);

    return {
      commissions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  /**
   * Get commission statistics for admin dashboard
   */
  static async getCommissionStats() {
    const [totalPaid, totalPending, monthlyStats] = await Promise.all([
      prisma.commission.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.commission.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
        _count: true,
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalPaid: totalPaid._sum.amount || 0,
      totalPending: totalPending._sum.amount || 0,
      monthlyStats,
    };
  }
}