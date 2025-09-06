import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateReviewRequest } from '@/lib/types/review';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateReviewRequest = await request.json();
    const { bookingId, rating, title, content, photos } = body;

    // Validate request
    if (!bookingId || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to review this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to review this booking' },
        { status: 403 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Cannot review incomplete booking' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        userId: session.user.id,
        itemId: booking.itemId,
        itemType: booking.itemType,
        rating,
        title,
        content,
        photos: photos || [],
        helpful: 0,
      },
    });

    // Update item rating statistics
    await prisma.$transaction(async (prisma) => {
      const itemStats = await prisma.itemStats.findUnique({
        where: {
          itemId_itemType: {
            itemId: booking.itemId,
            itemType: booking.itemType,
          },
        },
      });

      if (itemStats) {
        // Update existing stats
        await prisma.itemStats.update({
          where: {
            itemId_itemType: {
              itemId: booking.itemId,
              itemType: booking.itemType,
            },
          },
          data: {
            totalReviews: itemStats.totalReviews + 1,
            totalRating: itemStats.totalRating + rating,
            averageRating: (itemStats.totalRating + rating) / (itemStats.totalReviews + 1),
            [`rating${rating}Count`]: {
              increment: 1,
            },
          },
        });
      } else {
        // Create new stats
        await prisma.itemStats.create({
          data: {
            itemId: booking.itemId,
            itemType: booking.itemType,
            totalReviews: 1,
            totalRating: rating,
            averageRating: rating,
            rating1Count: rating === 1 ? 1 : 0,
            rating2Count: rating === 2 ? 1 : 0,
            rating3Count: rating === 3 ? 1 : 0,
            rating4Count: rating === 4 ? 1 : 0,
            rating5Count: rating === 5 ? 1 : 0,
          },
        });
      }
    });

    // Send notification to item owner/provider
    let recipientId: string;
    switch (booking.itemType) {
      case 'property':
        const property = await prisma.property.findUnique({
          where: { id: booking.itemId },
          select: { ownerId: true },
        });
        recipientId = property!.ownerId;
        break;
      case 'service':
      case 'leisure':
        const item = await prisma.service.findUnique({
          where: { id: booking.itemId },
          select: { providerId: true },
        });
        recipientId = item!.providerId;
        break;
      default:
        throw new Error('Invalid item type');
    }

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_REVIEW',
        title: 'New Review',
        message: `A new review has been posted for your ${booking.itemType}`,
        data: {
          reviewId: review.id,
          itemId: booking.itemId,
          itemType: booking.itemType,
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}