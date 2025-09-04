import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

import { ProfileView } from './profile-view';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export async function generateMetadata(
  { params }: ProfilePageProps
): Promise<Metadata> {
  const user = await prismadb.user.findUnique({
    where: { id: params.userId },
    select: { name: true }
  });

  if (!user) {
    return {
      title: 'Profile Not Found | GREIA',
    };
  }

  return {
    title: `${user.name}'s Profile | GREIA`,
    description: `View ${user.name}'s profile on GREIA`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.id === params.userId;

  // Get user profile data
  const user = await prismadb.user.findUnique({
    where: { id: params.userId },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          listings: true,
          reviews: true,
        }
      },
      verifications: {
        select: {
          type: true,
          status: true,
          verifiedAt: true,
        }
      },
      expertise: true,
      serviceAreas: true,
      qualifications: {
        select: {
          title: true,
          institution: true,
          year: true,
          verified: true,
        }
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      },
      listings: {
        take: 6,
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
      },
      posts: {
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          }
        }
      },
      achievements: {
        orderBy: { unlockedAt: 'desc' }
      },
    }
  });

  if (!user) {
    notFound();
  }

  // Check if current user follows this profile
  let isFollowing = false;
  if (session?.user) {
    const followRecord = await prismadb.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.userId,
        }
      }
    });
    isFollowing = !!followRecord;
  }

  // Get activity feed
  const activity = await prismadb.activity.findMany({
    where: { userId: params.userId },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
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

  // Get stats and analytics if own profile
  let analytics = null;
  if (isOwnProfile) {
    analytics = {
      views: await prismadb.profileView.count({
        where: { profileId: params.userId }
      }),
      listingViews: await prismadb.listingView.count({
        where: { listing: { userId: params.userId } }
      }),
      totalBookings: await prismadb.booking.count({
        where: { listing: { userId: params.userId } }
      }),
      totalEarnings: await prismadb.booking.aggregate({
        where: {
          listing: { userId: params.userId },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      reviewScore: await prismadb.review.aggregate({
        where: { userId: params.userId },
        _avg: { rating: true }
      }),
      responseRate: await prismadb.message.groupBy({
        by: ['userId'],
        where: { userId: params.userId },
        _avg: { responseTime: true }
      }),
    };
  }

  // Increment profile view count if not own profile
  if (!isOwnProfile && session?.user) {
    await prismadb.profileView.create({
      data: {
        profileId: params.userId,
        viewerId: session.user.id,
      }
    });
  }

  return (
    <ProfileView
      user={user}
      activity={activity}
      analytics={analytics}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      currentUser={session?.user ? {
        id: session.user.id,
        name: session.user.name!,
        image: session.user.image!,
      } : undefined}
    />
  );
}