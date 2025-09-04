import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

import { ListingsView } from './listings-view';

export const metadata: Metadata = {
  title: 'Listings | GREIA',
  description: 'Browse properties, services, and leisure activities on GREIA',
};

interface ListingsPageProps {
  searchParams: {
    category?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    tags?: string;
  };
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const session = await getServerSession(authOptions);

  // Build where clause based on search params
  const where = {
    ...(searchParams.category && { category: searchParams.category }),
    ...(searchParams.type && {
      OR: [
        { propertyListing: { propertyType: searchParams.type } },
        { serviceListing: { serviceType: searchParams.type } },
        { leisureListing: { leisureType: searchParams.type } },
      ]
    }),
    ...(searchParams.location && {
      OR: [
        { location: { contains: searchParams.location, mode: 'insensitive' } },
        { postcode: { contains: searchParams.location, mode: 'insensitive' } },
      ],
    }),
    ...(searchParams.minPrice && { price: { gte: parseFloat(searchParams.minPrice) } }),
    ...(searchParams.maxPrice && { price: { lte: parseFloat(searchParams.maxPrice) } }),
    ...(searchParams.tags && { tags: { hasSome: searchParams.tags.split(',') } }),
    visibility: 'PUBLIC',
  };

  // Get initial listings
  const listings = await prismadb.listing.findMany({
    where,
    take: 12,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          rating: true,
        }
      },
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

  // Get total count for pagination
  const total = await prismadb.listing.count({ where });

  // Get user's favorites if logged in
  let userFavorites: string[] = [];
  if (session?.user) {
    const favorites = await prismadb.favorite.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        listingId: true
      }
    });
    userFavorites = favorites.map(f => f.listingId);
  }

  // Get categories and types for filters
  const categories = [
    { label: 'Properties', value: 'PROPERTY' },
    { label: 'Services', value: 'SERVICE' },
    { label: 'Leisure', value: 'LEISURE' },
  ];

  const types = {
    PROPERTY: [
      { label: 'House', value: 'HOUSE' },
      { label: 'Flat', value: 'FLAT' },
      { label: 'Bungalow', value: 'BUNGALOW' },
      { label: 'Commercial', value: 'COMMERCIAL' },
    ],
    SERVICE: [
      { label: 'Trade', value: 'TRADE' },
      { label: 'Professional', value: 'PROFESSIONAL' },
      { label: 'Specialist', value: 'SPECIALIST' },
    ],
    LEISURE: [
      { label: 'Rental', value: 'RENTAL' },
      { label: 'Experience', value: 'EXPERIENCE' },
      { label: 'Venue', value: 'VENUE' },
    ],
  };

  // Get popular locations
  const popularLocations = await prismadb.listing.groupBy({
    by: ['location'],
    _count: {
      location: true
    },
    orderBy: {
      _count: {
        location: 'desc'
      }
    },
    take: 10,
  });

  // Get popular tags
  const popularTags = await prismadb.listing.groupBy({
    by: ['tags'],
    _count: {
      tags: true
    },
    orderBy: {
      _count: {
        tags: 'desc'
      }
    },
    take: 20,
  });

  return (
    <ListingsView
      initialListings={listings}
      totalListings={total}
      currentUser={session?.user ? {
        id: session.user.id,
        favorites: userFavorites,
      } : undefined}
      categories={categories}
      types={types}
      popularLocations={popularLocations.map(l => l.location)}
      popularTags={popularTags.flatMap(t => t.tags)}
      initialFilters={{
        category: searchParams.category,
        type: searchParams.type,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        location: searchParams.location,
        tags: searchParams.tags?.split(','),
      }}
    />
  );
}