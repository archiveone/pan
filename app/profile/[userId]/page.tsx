import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prismadb';

import { ProfileView } from './profile-view';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export async function generateMetadata(
  { params }: ProfilePageProps
): Promise<Metadata> {
  const user = await prisma.user.findUnique({
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

  const user = await prisma.user.findUnique({
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
      // New relations
      socialLinks: true,
      portfolioItems: {
        orderBy: { createdAt: 'desc' },
        take: 8,
      },
      todos: isOwnProfile ? { orderBy: { createdAt: 'desc' } } : false,
      educationHistory: true,
      workHistory: true,
      certifications: true,
      skills: true,
      languages: true,
      availability: true,
      customSections: {
        orderBy: { order: 'asc' }
      },

      verifications: true,
      expertise: true,
      serviceAreas: true,
      qualifications: true,
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

  let isFollowing = false;
  if (session?.user) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.userId,
        }
      }
    });
    isFollowing = !!followRecord;
  }

  const activity = await prisma.activity.findMany({
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

  if (!isOwnProfile && session?.user) {
    await prisma.profileView.create({
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