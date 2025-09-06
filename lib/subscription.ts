import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { SubscriptionTier, ListingType } from '@prisma/client';

export const FREE_TIER_LIMITS = {
  leisureListings: 3,
  featuredListings: false,
  analytics: false,
  crm: false,
};

export const PRO_TIER_LIMITS = {
  leisureListings: 999999, // Unlimited
  featuredListings: true,
  analytics: true,
  crm: true,
};

// Service listing weekly fee in EUR
export const SERVICE_LISTING_FEE = 10;

export async function updateUserSubscription(
  userId: string,
  tier: SubscriptionTier
) {
  const limits = tier === 'PRO' ? PRO_TIER_LIMITS : FREE_TIER_LIMITS;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      monthlyLeisureQuota: limits.leisureListings,
      hasAnalyticsAccess: limits.analytics,
      hasCrmAccess: limits.crm,
      hasFeatureListings: limits.featuredListings,
      // If downgrading to FREE, reset subscription end date
      subscriptionEnds: tier === 'FREE' ? null : undefined,
    },
  });
}

export async function checkLeisureQuota(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      monthlyLeisureQuota: true,
      monthlyLeisureUsed: true,
      quotaResetDate: true,
      subscriptionTier: true,
    },
  });

  if (!user) return false;

  // PRO users have unlimited listings
  if (user.subscriptionTier === 'PRO') return true;

  // Reset quota if it's a new month
  if (
    user.quotaResetDate &&
    new Date() > new Date(user.quotaResetDate)
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyLeisureUsed: 0,
        quotaResetDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ),
      },
    });
    return true;
  }

  return user.monthlyLeisureUsed < user.monthlyLeisureQuota;
}

export async function incrementLeisureCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyLeisureUsed: { increment: 1 },
      // Set reset date if not set
      quotaResetDate: {
        set: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ),
      },
    },
  });
}

export async function handleListingSubmission(
  userId: string,
  listingData: any,
  listingType: ListingType
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      isVerified: true,
      subscriptionTier: true,
    },
  });

  if (!user) throw new Error('User not found');

  switch (listingType) {
    case 'PROPERTY':
      // Properties are always free
      return await prisma.property.create({
        data: {
          ...listingData,
          ownerId: userId,
          isFeatured: user.subscriptionTier === 'PRO' && listingData.isFeatured,
        },
      });

    case 'SERVICE':
      // Services require weekly payment
      if (!listingData.paymentIntentId) {
        throw new Error('Payment required for service listing');
      }
      
      // Verify payment
      const paymentIntent = await stripe.paymentIntents.retrieve(
        listingData.paymentIntentId
      );
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not completed');
      }

      // Calculate expiration date (1 week from now)
      const paidUntil = new Date();
      paidUntil.setDate(paidUntil.getDate() + 7);

      return await prisma.service.create({
        data: {
          ...listingData,
          providerId: userId,
          paidUntil,
          isFeatured: user.subscriptionTier === 'PRO' && listingData.isFeatured,
        },
      });

    case 'LEISURE':
      // Check leisure listing quota for free users
      if (user.subscriptionTier === 'FREE') {
        const hasQuota = await checkLeisureQuota(userId);
        if (!hasQuota) {
          throw new Error('Monthly leisure listing quota exceeded');
        }
        await incrementLeisureCount(userId);
      }

      return await prisma.leisure.create({
        data: {
          ...listingData,
          ownerId: userId,
          isFeatured: user.subscriptionTier === 'PRO' && listingData.isFeatured,
        },
      });

    default:
      throw new Error('Invalid listing type');
  }
}

export async function createProSubscription(
  userId: string,
  paymentMethodId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user?.email) throw new Error('User email required');

  let customerId = user.stripeCustomerId;

  // Create or update Stripe customer
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: process.env.STRIPE_PRO_PRICE_ID }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

export async function createServiceListingPayment(amount: number = SERVICE_LISTING_FEE) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'eur',
    payment_method_types: ['card'],
    metadata: {
      type: 'service_listing',
      duration: '1_week',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}