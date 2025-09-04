import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import PrivateMarketplaceView from './components/private-marketplace-view';

export const metadata: Metadata = {
  title: 'Private Property Marketplace | GREIA',
  description: 'Connect landlords with verified real estate agents',
};

export default async function PrivateMarketplacePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/private-marketplace');
  }

  // Get user details including role and verification status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      isVerified: true,
      city: true,
      state: true,
      country: true,
    },
  });

  // Get user's private listings if they're a landlord
  const myListings = user?.role === 'USER' ? await prisma.listing.findMany({
    where: {
      ownerId: session.user.id,
      status: 'PRIVATE',
      category: 'PROPERTY',
    },
    include: {
      _count: {
        select: {
          enquiries: true,
        },
      },
      enquiries: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) : null;

  // Get available private listings if they're a verified agent
  const availableListings = (user?.role === 'AGENT' && user.isVerified) ? await prisma.listing.findMany({
    where: {
      status: 'PRIVATE',
      category: 'PROPERTY',
      city: user.city,
      state: user.state,
      country: user.country,
      // Exclude listings the agent has already inquired about
      NOT: {
        enquiries: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          enquiries: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) : null;

  // Get agent's inquiries if they're a verified agent
  const myInquiries = (user?.role === 'AGENT' && user.isVerified) ? await prisma.listingEnquiry.findMany({
    where: {
      userId: session.user.id,
      listing: {
        status: 'PRIVATE',
        category: 'PROPERTY',
      },
    },
    include: {
      listing: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) : null;

  return (
    <PrivateMarketplaceView
      user={user}
      myListings={myListings}
      availableListings={availableListings}
      myInquiries={myInquiries}
    />
  );
}