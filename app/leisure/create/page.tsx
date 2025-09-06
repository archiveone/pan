import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeisureListingForm } from '@/components/leisure/LeisureListingForm';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Create Leisure Listing - GREIA',
  description: 'Create a new leisure listing on GREIA platform',
};

export default async function CreateLeisurePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get user's quota information
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionTier: true,
      monthlyLeisureQuota: true,
      monthlyLeisureUsed: true,
      quotaResetDate: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Reset quota if it's a new month
  if (user.quotaResetDate && new Date() > new Date(user.quotaResetDate)) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        monthlyLeisureUsed: 0,
        quotaResetDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ),
      },
    });
    user.monthlyLeisureUsed = 0;
  }

  const quotaInfo = {
    used: user.monthlyLeisureUsed,
    limit: user.monthlyLeisureQuota,
    isPro: user.subscriptionTier === 'PRO',
  };

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Leisure Listing</h1>
        <p className="mt-2 text-muted-foreground">
          List your rental, experience, or event on GREIA.
          {user.subscriptionTier === 'FREE' && (
            ' Free users can create up to 3 leisure listings per month.'
          )}
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <LeisureListingForm
          mode="create"
          quotaInfo={quotaInfo}
        />
      </div>
    </div>
  );
}