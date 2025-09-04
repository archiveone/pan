import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

import { SettingsView } from './settings-view';

export const metadata: Metadata = {
  title: 'Settings | GREIA',
  description: 'Manage your account settings on GREIA',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get user data
  const user = await prismadb.user.findUnique({
    where: { id: session.user.id },
    include: {
      verifications: true,
      expertise: true,
      serviceAreas: true,
      qualifications: true,
      notificationPreferences: true,
      privacySettings: true,
      paymentMethods: {
        select: {
          id: true,
          type: true,
          lastFour: true,
          expiryDate: true,
          isDefault: true,
        }
      },
      bankAccounts: {
        select: {
          id: true,
          accountName: true,
          lastFour: true,
          isDefault: true,
        }
      },
      subscriptions: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
          plan: true,
          startDate: true,
          nextBillingDate: true,
          amount: true,
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Get billing history
  const billingHistory = await prismadb.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <SettingsView
      user={user}
      billingHistory={billingHistory}
    />
  );
}