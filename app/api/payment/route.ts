import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { calculateApplicationFee } from '@/lib/fees';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      amount,
      currency,
      bookingId,
      itemType,
      itemId,
      metadata = {},
    } = body;

    if (!amount || !currency || !bookingId || !itemType || !itemId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch the booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Calculate application fee
    const applicationFee = calculateApplicationFee(amount, itemType);

    // Create a Stripe Customer if not exists
    let customerId = session.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Update user with Stripe Customer ID
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: booking.item.owner.stripeAccountId,
      },
      metadata: {
        bookingId,
        itemId,
        itemType,
        userId: session.user.id,
        ...metadata,
      },
    });

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: paymentIntent.id,
        status: 'PENDING_PAYMENT',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update booking status based on payment intent status
    const booking = await prisma.booking.findFirst({
      where: { paymentIntentId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    let status;
    switch (paymentIntent.status) {
      case 'succeeded':
        status = 'CONFIRMED';
        break;
      case 'canceled':
        status = 'CANCELLED';
        break;
      case 'requires_payment_method':
        status = 'PAYMENT_FAILED';
        break;
      default:
        status = 'PENDING_PAYMENT';
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status },
    });

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Payment status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}

// Stripe Webhook handler
export async function PATCH(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handleFailedPayment(failedPayment);
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object;
        await handleCanceledPayment(canceledPayment);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleSuccessfulPayment(paymentIntent: any) {
  const booking = await prisma.booking.findFirst({
    where: { paymentIntentId: paymentIntent.id },
    include: {
      user: true,
      item: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!booking) return;

  await prisma.$transaction([
    // Update booking status
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' },
    }),

    // Create transaction record
    prisma.transaction.create({
      data: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'COMPLETED',
        type: 'PAYMENT',
        bookingId: booking.id,
        userId: booking.userId,
        paymentIntentId: paymentIntent.id,
        applicationFee: paymentIntent.application_fee_amount,
      },
    }),

    // Create notification for buyer
    prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'PAYMENT',
        title: 'Payment Successful',
        message: \`Your payment for booking #\${booking.id} has been confirmed.\`,
        data: { bookingId: booking.id },
      },
    }),

    // Create notification for seller
    prisma.notification.create({
      data: {
        userId: booking.item.ownerId,
        type: 'BOOKING',
        title: 'New Booking Confirmed',
        message: \`You have a new confirmed booking #\${booking.id}.\`,
        data: { bookingId: booking.id },
      },
    }),
  ]);
}

async function handleFailedPayment(paymentIntent: any) {
  const booking = await prisma.booking.findFirst({
    where: { paymentIntentId: paymentIntent.id },
    include: { user: true },
  });

  if (!booking) return;

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'PAYMENT_FAILED' },
    }),

    prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'PAYMENT',
        title: 'Payment Failed',
        message: \`Your payment for booking #\${booking.id} has failed. Please try again.\`,
        data: { bookingId: booking.id },
      },
    }),
  ]);
}

async function handleCanceledPayment(paymentIntent: any) {
  const booking = await prisma.booking.findFirst({
    where: { paymentIntentId: paymentIntent.id },
  });

  if (!booking) return;

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  });
}