import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReviewFilters } from '@/lib/types/review';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') as ReviewFilters['sortBy'];
    const hasPhotos = searchParams.get('hasPhotos') === 'true';
    const hasResponse = searchParams.get('hasResponse') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Build where clause
    const where = {
      itemId,
      itemType,
      ...(rating && { rating: parseInt(rating) }),
      ...(hasPhotos && { photos: { isEmpty: false } }),
      ...(hasResponse && { response: { isNot: null } }),
    };

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'helpful') {
      orderBy = { helpful: 'desc' };
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Get review statistics
    const stats = await prisma.itemStats.findUnique({
      where: {
        itemId_itemType: {
          itemId,
          itemType,
        },
      },
    });

    // Format statistics
    const reviewStats = stats
      ? {
          averageRating: stats.averageRating,
          totalReviews: stats.totalReviews,
          ratingDistribution: {
            1: stats.rating1Count,
            2: stats.rating2Count,
            3: stats.rating3Count,
            4: stats.rating4Count,
            5: stats.rating5Count,
          },
        }
      : {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        };

    // Format response
    const response = {
      reviews,
      stats: reviewStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting item reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}