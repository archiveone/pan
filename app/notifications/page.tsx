import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

import { NotificationsView } from './notifications-view';

export const metadata: Metadata = {
  title: 'Notifications | GREIA',
  description: 'View and manage your notifications on the GREIA platform',
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get initial notifications
  const notifications = await prismadb.notification.findMany({
    where: {
      userId: session.user.id,
    },
    take: 20,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  });

  // Get unread count
  const unreadCount = await prismadb.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    }
  });

  // Get user's notification preferences
  const user = await prismadb.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      notificationPreferences: true,
    }
  });

  return (
    <div className="container mx-auto py-6">
      <NotificationsView
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
        initialPreferences={user?.notificationPreferences || {}}
      />
    </div>
  );
}