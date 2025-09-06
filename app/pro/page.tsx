import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { ProSubscriptionButton } from '@/components/pro/ProSubscriptionButton';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Upgrade to PRO - GREIA',
  description: 'Unlock premium features with GREIA PRO subscription',
};

export default async function ProPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is already PRO
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true },
  });

  if (user?.subscriptionTier === 'PRO') {
    redirect('/dashboard');
  }

  const features = [
    'Unlimited leisure listings',
    'Featured listings across all categories',
    'Advanced analytics and insights',
    'Priority support',
    'Enhanced profile features',
    'Early access to new features',
    'Comprehensive CRM tools',
    'Private marketplace access',
  ];

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Upgrade to GREIA PRO</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Take your experience to the next level
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card className="p-8">
          <div className="flex items-center justify-between border-b pb-8">
            <div>
              <h2 className="text-3xl font-bold">PRO Plan</h2>
              <p className="mt-2 text-muted-foreground">
                All the premium features you need
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">€29</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-8">
            <ProSubscriptionButton />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Cancel anytime. No long-term commitment required.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">What's included in PRO?</h3>
            <p className="mt-2 text-muted-foreground">
              PRO includes unlimited leisure listings, featured listings across all categories,
              advanced analytics, and much more. You'll have access to all premium features
              and future updates.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Can I cancel anytime?</h3>
            <p className="mt-2 text-muted-foreground">
              Yes, you can cancel your PRO subscription at any time. You'll continue to have
              access to PRO features until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">How does billing work?</h3>
            <p className="mt-2 text-muted-foreground">
              You'll be billed €29 monthly. Your subscription will automatically renew each
              month, but you can cancel anytime from your account settings.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">What payment methods are accepted?</h3>
            <p className="mt-2 text-muted-foreground">
              We accept all major credit cards and debit cards. Payments are processed
              securely through Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}