import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  stripe,
  createStripeCustomer,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  getSubscription,
  createPortalSession,
  PLANS,
} from '@/lib/stripe';

// GET /api/subscription - Get current subscription
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with subscription details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeCustomerId: true,
        subscriptionId: true,
        subscriptionStatus: true,
        plan: true,
      },
    });

    if (!user?.subscriptionId) {
      return NextResponse.json({
        plan: 'FREE',
        status: 'inactive',
      });
    }

    // Get subscription details from Stripe
    const subscription = await getSubscription(user.subscriptionId);

    // Get default payment method
    let defaultPaymentMethod = null;
    if (subscription.default_payment_method) {
      const paymentMethod = subscription.default_payment_method as any;
      defaultPaymentMethod = {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      };
    }

    return NextResponse.json({
      id: subscription.id,
      plan: user.plan,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      defaultPaymentMethod,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST /api/subscription/upgrade - Upgrade or change subscription
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
    const { planId } = body;

    // Validate plan
    if (!PLANS[planId] || planId === 'FREE') {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeCustomerId: true,
        subscriptionId: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let stripeCustomerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer(
        user.email!,
        user.name || undefined
      );

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId },
      });
    }

    if (user.subscriptionId) {
      // Update existing subscription
      const subscription = await updateSubscription(
        user.subscriptionId,
        PLANS[planId].stripePriceId!
      );

      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription as any).latest_invoice.payment_intent.client_secret,
      });
    } else {
      // Create new subscription
      const subscription = await createSubscription(
        stripeCustomerId,
        PLANS[planId].stripePriceId!
      );

      // Update user with subscription details
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          plan: planId,
          subscriptionUpdatedAt: new Date(),
        },
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription as any).latest_invoice.payment_intent.client_secret,
      });
    }
  } catch (error) {
    console.error('Subscription upgrade error:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}

// POST /api/subscription/cancel - Cancel subscription
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionId: true },
    });

    if (!user?.subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe
    await cancelSubscription(user.subscriptionId);

    // Update user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

// POST /api/subscription/portal - Create Stripe billing portal session
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 400 }
      );
    }

    // Create portal session
    const returnUrl = new URL(req.url).origin + '/settings/subscription';
    const url = await createPortalSession(user.stripeCustomerId, returnUrl);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Portal session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}