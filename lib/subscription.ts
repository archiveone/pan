import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { SubscriptionTier, UserRole, PropertyStatus } from '@prisma/client';

export const FREE_TIER_LIMITS = {
  monthlyListings: 3,
  featuredListings: false,
  analytics: false,
  crm: false,
  privateMarketplace: false,
};

export const PRO_TIER_LIMITS = {
  monthlyListings: 999999, // Unlimited
  featuredListings: true,
  analytics: true,
  crm: true,
  privateMarketplace: true,
};

export async function updateUserSubscription(
  userId: string,
  tier: SubscriptionTier
) {
  const limits = tier === 'PRO' ? PRO_TIER_LIMITS : FREE_TIER_LIMITS;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      monthlyListingQuota: limits.monthlyListings,
      hasAnalyticsAccess: limits.analytics,
      hasCrmAccess: limits.crm,
      hasFeatureListings: limits.featuredListings,
      hasPrivateMarketplace: limits.privateMarketplace,
      // If downgrading to FREE, reset subscription end date
      subscriptionEnds: tier === 'FREE' ? null : undefined,
    },
  });
}

export async function checkListingQuota(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      monthlyListingQuota: true,
      monthlyListingsUsed: true,
      quotaResetDate: true,
    },
  });

  if (!user) return false;

  // Reset quota if it's a new month
  if (
    user.quotaResetDate &&
    new Date() > new Date(user.quotaResetDate)
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyListingsUsed: 0,
        quotaResetDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ),
      },
    });
    return true;
  }

  return user.monthlyListingsUsed < user.monthlyListingQuota;
}

export async function incrementListingCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyListingsUsed: { increment: 1 },
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

export async function handlePropertySubmission(
  userId: string,
  propertyData: any
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

  // Check if user has available quota
  const hasQuota = await checkListingQuota(userId);
  if (!hasQuota) {
    throw new Error('Monthly listing quota exceeded');
  }

  // Determine marketplace placement based on role
  const inAgentMarketplace = user.role === 'LANDLORD';
  const inPublicMarketplace = user.role === 'AGENT' && user.isVerified;

  // Create property with appropriate status
  const property = await prisma.property.create({
    data: {
      ...propertyData,
      ownerId: userId,
      status: determineInitialStatus(user.role),
      inAgentMarketplace,
      inPublicMarketplace,
      // Featured listing only available for PRO users
      isFeatured: user.subscriptionTier === 'PRO' && propertyData.isFeatured,
    },
  });

  // Increment the user's listing count
  await incrementListingCount(userId);

  return property;
}

function determineInitialStatus(role: UserRole): PropertyStatus {
  switch (role) {
    case 'ADMIN':
      return 'ACTIVE';
    case 'AGENT':
      return 'PENDING_REVIEW'; // Requires admin review
    case 'LANDLORD':
      return 'PENDING_REVIEW'; // Goes to agent marketplace
    default:
      return 'DRAFT';
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