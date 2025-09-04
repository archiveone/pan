import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Basic access to GREIA platform',
    features: [
      'Basic property listings',
      'Limited CRM features',
      'Basic messaging',
      'Limited file storage (100MB)',
    ],
    limitations: {
      propertyListings: 3,
      leads: 10,
      storage: 100 * 1024 * 1024, // 100MB
      messagingThreads: 5,
    },
    price: 0,
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    description: 'Essential tools for property professionals',
    features: [
      'Up to 25 property listings',
      'Full CRM access',
      'Unlimited messaging',
      '1GB file storage',
      'Basic analytics',
    ],
    limitations: {
      propertyListings: 25,
      leads: 100,
      storage: 1024 * 1024 * 1024, // 1GB
      messagingThreads: -1, // unlimited
    },
    price: 29.99,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID,
  },
  PRO: {
    id: 'pro',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    features: [
      'Up to 100 property listings',
      'Advanced CRM with automation',
      'Priority support',
      '5GB file storage',
      'Advanced analytics',
      'Custom branding',
    ],
    limitations: {
      propertyListings: 100,
      leads: 500,
      storage: 5 * 1024 * 1024 * 1024, // 5GB
      messagingThreads: -1, // unlimited
    },
    price: 79.99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    features: [
      'Unlimited property listings',
      'Enterprise CRM features',
      'Dedicated support',
      'Unlimited storage',
      'Custom analytics',
      'API access',
      'Custom integrations',
    ],
    limitations: {
      propertyListings: -1, // unlimited
      leads: -1, // unlimited
      storage: -1, // unlimited
      messagingThreads: -1, // unlimited
    },
    price: 299.99,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Utility function to check if user is within plan limits
export async function checkPlanLimits(
  userId: string,
  planId: PlanId,
  type: keyof (typeof PLANS)[PlanId]['limitations'],
  currentCount: number
): Promise<boolean> {
  const plan = PLANS[planId];
  const limit = plan.limitations[type];
  
  // -1 indicates unlimited
  if (limit === -1) return true;
  
  return currentCount < limit;
}

// Utility function to format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(price);
}

// Create Stripe customer
export async function createStripeCustomer(
  email: string,
  name?: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      createdAt: new Date().toISOString(),
    },
  });
  
  return customer.id;
}

// Create Stripe subscription
export async function createSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

// Cancel Stripe subscription
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

// Update Stripe subscription
export async function updateSubscription(
  subscriptionId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: priceId,
    }],
    proration_behavior: 'create_prorations',
  });
}

// Get Stripe subscription
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'default_payment_method'],
  });
}

// Create Stripe checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?success=false`,
  });
  
  return session.url!;
}

// Create Stripe portal session
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session.url;
}

// Create Stripe Identity verification session
export async function createIdentitySession(
  userId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.identity.verificationSessions.create({
    type: 'document',
    metadata: {
      userId,
    },
    return_url: returnUrl,
  });
  
  return session.url;
}

// Check Identity verification status
export async function checkIdentityStatus(
  sessionId: string
): Promise<Stripe.Identity.VerificationSession> {
  return await stripe.identity.verificationSessions.retrieve(sessionId);
}

// Handle subscription updated webhook
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  // Update user's subscription status in database
  const status = subscription.status;
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;
  
  // Find plan by price ID
  const plan = Object.entries(PLANS).find(
    ([_, planData]) => planData.stripePriceId === priceId
  );
  
  if (!plan) throw new Error('Invalid price ID');
  
  // Update user subscription in database
  await prisma.user.update({
    where: {
      stripeCustomerId: customerId,
    },
    data: {
      subscriptionStatus: status,
      subscriptionId: subscription.id,
      plan: plan[0] as PlanId,
      subscriptionUpdatedAt: new Date(),
    },
  });
}

// Handle subscription deleted webhook
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = subscription.customer as string;
  
  // Update user subscription in database
  await prisma.user.update({
    where: {
      stripeCustomerId: customerId,
    },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionId: null,
      plan: 'FREE',
      subscriptionUpdatedAt: new Date(),
    },
  });
}

// Handle identity verification completed webhook
export async function handleIdentityVerified(
  session: Stripe.Identity.VerificationSession
): Promise<void> {
  const userId = session.metadata.userId;
  
  if (session.status === 'verified') {
    // Update user verification status in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });
  }
}