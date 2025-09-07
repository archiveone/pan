import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'identity.verification_session.verified':
        await handleVerificationSuccess(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'identity.verification_session.requires_input':
        await handleVerificationRequiresInput(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful identity verification
async function handleVerificationSuccess(session: Stripe.Identity.VerificationSession) {
  try {
    const userId = session.metadata?.userId;
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        stripeVerificationId: session.id,
      },
    });
  } catch (error) {
    console.error('Error handling verification success:', error);
    throw error;
  }
}

// Handle verification requiring additional input
async function handleVerificationRequiresInput(session: Stripe.Identity.VerificationSession) {
  try {
    const userId = session.metadata?.userId;
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'REQUIRES_INPUT',
        verificationMessage: session.last_error?.message || 'Additional information required',
      },
    });
  } catch (error) {
    console.error('Error handling verification input required:', error);
    throw error;
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    const serviceId = session.metadata?.serviceId;
    if (!userId || !serviceId) return;

    // Update service subscription status
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        status: 'ACTIVE',
        stripeSubscriptionId: session.subscription as string,
        paidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Update user's stripe customer ID if not already set
    if (session.customer) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: session.customer as string,
        },
      });
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const service = await prisma.service.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!service) return;

    await prisma.service.update({
      where: { id: service.id },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        paidUntil: new Date(subscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

// Handle subscription deletions
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const service = await prisma.service.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!service) return;

    await prisma.service.update({
      where: { id: service.id },
      data: {
        status: 'INACTIVE',
        paidUntil: new Date(),
      },
    });
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}