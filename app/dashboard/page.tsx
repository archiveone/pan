import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

import { DashboardView } from './dashboard-view';

export const metadata: Metadata = {
  title: 'Dashboard | GREIA',
  description: 'Manage your GREIA account and activities',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get user data with counts
  const user = await prismadb.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          listings: true,
          followers: true,
          following: true,
          reviews: true,
        }
      },
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Get recent listings
  const recentListings = await prismadb.listing.findMany({
    where: { userId: session.user.id },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      propertyListing: true,
      serviceListing: true,
      leisureListing: true,
      _count: {
        select: {
          favorites: true,
          views: true,
          bookings: true,
        }
      }
    }
  });

  // Get recent bookings
  const recentBookings = await prismadb.booking.findMany({
    where: { 
      OR: [
        { userId: session.user.id },
        { listing: { userId: session.user.id } }
      ]
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          images: true,
          price: true,
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  });

  // Get recent messages
  const recentMessages = await prismadb.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id
        }
      }
    },
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      }
    }
  });

  // Get recent notifications
  const recentNotifications = await prismadb.notification.findMany({
    where: { userId: session.user.id },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  // Get analytics
  const analytics = {
    // Profile views in the last 30 days
    profileViews: await prismadb.profileView.count({
      where: {
        profileId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Listing views in the last 30 days
    listingViews: await prismadb.listingView.count({
      where: {
        listing: { userId: session.user.id },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Bookings in the last 30 days
    bookings: await prismadb.booking.count({
      where: {
        listing: { userId: session.user.id },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Earnings in the last 30 days
    earnings: await prismadb.booking.aggregate({
      where: {
        listing: { userId: session.user.id },
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _sum: { amount: true }
    }),
    
    // Average rating
    rating: await prismadb.review.aggregate({
      where: { userId: session.user.id },
      _avg: { rating: true }
    }),
  };

  // Get activity feed
  const activityFeed = await prismadb.activity.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { 
          user: { 
            followers: { 
              some: { followerId: session.user.id } 
            } 
          } 
        }
      ]
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      listing: {
        select: {
          id: true,
          title: true,
          images: true,
        }
      },
      post: {
        select: {
          id: true,
          content: true,
          images: true,
        }
      },
    }
  });

  return (
    <DashboardView
      user={user}
      recentListings={recentListings}
      recentBookings={recentBookings}
      recentMessages={recentMessages}
      recentNotifications={recentNotifications}
      analytics={analytics}
      activityFeed={activityFeed}
    />
  );
}