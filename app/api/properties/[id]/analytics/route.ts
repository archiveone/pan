import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Analytics query params schema
const queryParamsSchema = z.object({
  timeframe: z.enum(['7D', '1M', '3M', '6M', '1Y', 'ALL']).default('1M'),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to property analytics
    const property = await prisma.property.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          { agents: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or unauthorized' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { timeframe } = queryParamsSchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeframe) {
      case '7D':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Fetch analytics data
    const [
      viewings,
      offers,
      favorites,
      reviews,
      comparableProperties,
      marketStats,
    ] = await Promise.all([
      // Viewings over time
      prisma.propertyViewing.findMany({
        where: {
          propertyId: params.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      }),

      // Offers over time
      prisma.propertyOffer.findMany({
        where: {
          propertyId: params.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      }),

      // Favorites count over time
      prisma.propertyFavorite.findMany({
        where: {
          propertyId: params.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      }),

      // Reviews over time
      prisma.propertyReview.findMany({
        where: {
          propertyId: params.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),

      // Comparable properties
      prisma.property.findMany({
        where: {
          id: { not: params.id },
          type: property.type,
          listingType: property.listingType,
          price: {
            gte: property.price * 0.8,
            lte: property.price * 1.2,
          },
          address: {
            city: property.address?.city,
          },
        },
        take: 5,
        include: {
          address: true,
          _count: {
            select: {
              viewings: true,
              offers: true,
              favorites: true,
            },
          },
        },
      }),

      // Market statistics
      prisma.property.aggregate({
        where: {
          type: property.type,
          listingType: property.listingType,
          address: {
            city: property.address?.city,
          },
        },
        _avg: {
          price: true,
          size: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Process data for time series
    const timeSeriesData = processTimeSeriesData(
      startDate,
      now,
      viewings,
      offers,
      favorites
    );

    // Calculate market insights
    const marketInsights = {
      averagePrice: marketStats._avg.price || 0,
      averageSize: marketStats._avg.size || 0,
      totalListings: marketStats._count.id,
      pricePerSqm: marketStats._avg.price && marketStats._avg.size
        ? marketStats._avg.price / marketStats._avg.size
        : 0,
      comparableProperties: comparableProperties.map(prop => ({
        id: prop.id,
        price: prop.price,
        size: prop.size,
        address: prop.address,
        engagement: {
          viewings: prop._count.viewings,
          offers: prop._count.offers,
          favorites: prop._count.favorites,
        },
      })),
    };

    // Calculate performance metrics
    const performanceMetrics = {
      totalViews: viewings.length,
      totalOffers: offers.length,
      totalFavorites: favorites.length,
      averageRating: reviews.length
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0,
      offerConversionRate: viewings.length
        ? (offers.length / viewings.length) * 100
        : 0,
    };

    return NextResponse.json({
      timeSeriesData,
      marketInsights,
      performanceMetrics,
      reviews: reviews.slice(0, 5), // Latest 5 reviews
    });
  } catch (error) {
    console.error('Error in GET /api/properties/[id]/analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function processTimeSeriesData(
  startDate: Date,
  endDate: Date,
  viewings: any[],
  offers: any[],
  favorites: any[]
) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const data = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const dayViewings = viewings.filter(v =>
      v.createdAt.toISOString().startsWith(dateStr)
    ).length;

    const dayOffers = offers.filter(o =>
      o.createdAt.toISOString().startsWith(dateStr)
    ).length;

    const dayFavorites = favorites.filter(f =>
      f.createdAt.toISOString().startsWith(dateStr)
    ).length;

    data.push({
      date: dateStr,
      viewings: dayViewings,
      offers: dayOffers,
      favorites: dayFavorites,
    });
  }

  return data;
}