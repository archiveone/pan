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
    const agentCommissionRate = 0.05; // Agent's 5% commission
    const agentCommissionAmount = listingPrice * agentCommissionRate;
    const greiaCommissionRate = 0.05; // GREIA's 5% of agent's commission
    const greiaCommissionAmount = agentCommissionAmount * greiaCommissionRate;

    // Calculate the final amount the agent receives
    const agentFinalAmount = agentCommissionAmount - greiaCommissionAmount;

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return await prisma.commission.create({
      data: {
        amount: agentFinalAmount, // Amount agent receives
        greiaAmount: greiaCommissionAmount, // Amount GREIA receives
        totalAmount: agentCommissionAmount, // Total commission amount
        dueDate,
        agentId,
        listingId: inquiry.listingId,
        inquiryId: inquiry.id,
        metadata: {
          listingPrice,
          agentCommissionRate,
          greiaCommissionRate,
        },
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
      // Create a transfer to the agent's Stripe account
      const transfer = await stripe.transfers.create({
        amount: Math.round(Number(commission.amount) * 100), // Convert to cents
        currency: 'gbp',
        destination: commission.agent.stripeAccountId,
        metadata: {
          commissionId: commission.id,
          listingId: commission.listingId,
          agentId: commission.agentId,
          type: 'agent_commission',
        },
      });

      // Update commission record
      return await prisma.commission.update({
        where: { id: commissionId },
        data: {
          status: 'PROCESSING',
          stripePaymentId: transfer.id,
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
    transfer: Stripe.Transfer
  ): Promise<Commission> {
    const { commissionId } = transfer.metadata;

    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        transactionRef: transfer.id,
      },
    });
  }

  /**
   * Get commission summary for an agent
   */
  static async getAgentCommissionSummary(agentId: string) {
    const [pending, processing, paid, total, greiaTotal] = await Promise.all([
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
          amount: true, // Agent's amount
        },
      }),
      prisma.commission.aggregate({
        where: {
          agentId,
          status: 'PAID',
        },
        _sum: {
          greiaAmount: true, // GREIA's amount
        },
      }),
    ]);

    return {
      pending,
      processing,
      paid,
      totalEarned: total._sum.amount || 0,
      totalGreiaCommission: greiaTotal._sum.greiaAmount || 0,
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
      commissions: commissions.map(commission => ({
        ...commission,
        breakdown: {
          totalCommission: commission.totalAmount,
          agentAmount: commission.amount,
          greiaAmount: commission.greiaAmount,
          listingPrice: commission.metadata.listingPrice,
          agentRate: commission.metadata.agentCommissionRate,
          greiaRate: commission.metadata.greiaCommissionRate,
        },
      })),
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
        _sum: {
          greiaAmount: true, // Only GREIA's portion
        },
      }),
      prisma.commission.aggregate({
        where: { status: 'PENDING' },
        _sum: {
          greiaAmount: true, // Only GREIA's portion
        },
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
          greiaAmount: true, // Only GREIA's portion
        },
      }),
    ]);

    return {
      totalPaid: totalPaid._sum.greiaAmount || 0,
      totalPending: totalPending._sum.greiaAmount || 0,
      monthlyStats,
    };
  }

  /**
   * Calculate commission breakdown for a listing
   */
  static calculateCommissionBreakdown(listingPrice: number) {
    const agentCommissionRate = 0.05; // 5%
    const greiaCommissionRate = 0.05; // 5% of agent's commission

    const agentCommissionAmount = listingPrice * agentCommissionRate;
    const greiaCommissionAmount = agentCommissionAmount * greiaCommissionRate;
    const agentFinalAmount = agentCommissionAmount - greiaCommissionAmount;

    return {
      listingPrice,
      totalCommission: agentCommissionAmount,
      agentAmount: agentFinalAmount,
      greiaAmount: greiaCommissionAmount,
      rates: {
        agent: agentCommissionRate,
        greia: greiaCommissionRate,
      },
    };
  }
}