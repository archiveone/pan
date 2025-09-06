import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { handleListingSubmission, createServiceListingPayment } from '@/lib/subscription';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { action } = data;

    // Handle payment intent creation
    if (action === 'create_payment') {
      const paymentData = await createServiceListingPayment();
      return NextResponse.json(paymentData);
    }

    // Handle service listing creation
    const service = await handleListingSubmission(
      session.user.id,
      data,
      'SERVICE'
    );

    return NextResponse.json(service);
  } catch (error: any) {
    if (error.message === 'Payment required for service listing') {
      return NextResponse.json(
        {
          error: 'Payment required',
          message: 'Service listings require a €10 weekly fee',
        },
        { status: 402 }
      );
    }

    console.error('Error in POST /api/services:', error);
    return NextResponse.json(
      { error: 'Failed to create service listing' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Build query based on filters
    const query: any = {
      where: {},
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            isVerified: true,
            rating: true,
            totalReviews: true,
          },
        },
        reviews: {
          where: {
            isVerified: true,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    };

    // Apply filters
    if (category) {
      query.where.category = category;
    }

    if (status) {
      query.where.status = status;
    }

    // Only show active (paid and not expired) listings
    if (activeOnly) {
      query.where.AND = [
        { status: 'ACTIVE' },
        { paidUntil: { gt: new Date() } },
      ];
    }

    const services = await prisma.service.findMany(query);

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error in GET /api/services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, action, ...updateData } = data;

    // Handle payment extension
    if (action === 'extend') {
      const service = await prisma.service.findUnique({
        where: { id },
        select: { providerId: true, paidUntil: true },
      });

      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      if (service.providerId !== session.user.id) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }

      // Create new payment intent for extension
      const paymentData = await createServiceListingPayment();
      return NextResponse.json(paymentData);
    }

    // Handle payment confirmation and extension
    if (action === 'confirm_extension') {
      const { paymentIntentId } = data;
      
      // Verify payment
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not completed');
      }

      // Extend paid period by 1 week
      const service = await prisma.service.findUnique({
        where: { id },
        select: { paidUntil: true },
      });

      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      const newPaidUntil = new Date(
        Math.max(
          service.paidUntil?.getTime() || Date.now(),
          Date.now()
        ) + 7 * 24 * 60 * 60 * 1000
      );

      const updatedService = await prisma.service.update({
        where: { id },
        data: {
          paidUntil: newPaidUntil,
          status: 'ACTIVE',
        },
      });

      return NextResponse.json(updatedService);
    }

    // Handle regular updates
    const service = await prisma.service.findUnique({
      where: { id },
      select: { providerId: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (service.providerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error in PUT /api/services:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}