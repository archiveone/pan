import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Review creation/update schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
});

// Review query params schema
const queryParamsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  sortBy: z.enum(['date_desc', 'date_asc', 'rating_desc', 'rating_asc']).default('date_desc'),
  filter: z.enum(['all', 'verified', 'unverified']).default('all'),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { page, limit, sortBy, filter } = queryParamsSchema.parse(queryParams);

    // Build where clause
    const where = {
      propertyId: params.id,
      ...(filter === 'verified' ? { isVerified: true } :
          filter === 'unverified' ? { isVerified: false } : {}),
    };

    // Build orderBy
    const orderBy = {
      [sortBy.startsWith('date') ? 'createdAt' : 'rating']:
        sortBy.endsWith('desc') ? 'desc' : 'asc',
    };

    // Execute query
    const [reviews, total] = await Promise.all([
      prisma.propertyReview.findMany({
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
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      }),
      prisma.propertyReview.count({ where }),
    ]);

    // Calculate average rating
    const averageRating = await prisma.propertyReview.aggregate({
      where: { propertyId: params.id },
      _avg: {
        rating: true,
      },
    });

    return NextResponse.json({
      reviews,
      averageRating: averageRating._avg.rating || 0,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/properties/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check if user has already reviewed this property
    const existingReview = await prisma.propertyReview.findUnique({
      where: {
        propertyId_userId: {
          propertyId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this property' },
        { status: 400 }
      );
    }

    // Check if user has interacted with the property (viewing, offer, etc.)
    const hasInteraction = await prisma.propertyViewing.findFirst({
      where: {
        propertyId: params.id,
        userId: session.user.id,
        status: 'COMPLETED',
      },
    });

    // Create review
    const review = await prisma.propertyReview.create({
      data: {
        ...validatedData,
        propertyId: params.id,
        userId: session.user.id,
        isVerified: !!hasInteraction,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/properties/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { reviewId, ...data } = body;
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const validatedData = reviewSchema.parse(data);

    // Check if user owns the review
    const review = await prisma.propertyReview.findFirst({
      where: {
        id: reviewId,
        userId: session.user.id,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update review
    const updatedReview = await prisma.propertyReview.update({
      where: { id: reviewId },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PUT /api/properties/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the review or is an admin
    const review = await prisma.propertyReview.findFirst({
      where: {
        id: reviewId,
        OR: [
          { userId: session.user.id },
          { property: { userId: session.user.id } },
        ],
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete review
    await prisma.propertyReview.delete({
      where: { id: reviewId },
    });

    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/properties/[id]/reviews:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}