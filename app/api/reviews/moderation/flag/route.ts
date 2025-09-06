import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReviewFlagReason } from '@/lib/types/reviewModeration';

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

    const body: {
      reviewId: string;
      reason: ReviewFlagReason;
      details?: string;
    } = await request.json();

    const { reviewId, reason, details } = body;

    // Get the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user has already flagged this review
    const existingFlag = await prisma.reviewFlag.findFirst({
      where: {
        reviewId,
        userId: session.user.id,
        status: 'pending',
      },
    });

    if (existingFlag) {
      return NextResponse.json(
        { error: 'You have already flagged this review' },
        { status: 400 }
      );
    }

    // Create flag and update review status
    const [flag] = await prisma.$transaction([
      // Create flag
      prisma.reviewFlag.create({
        data: {
          reviewId,
          userId: session.user.id,
          reason,
          details,
          status: 'pending',
        },
      }),

      // Update review status to flagged if it has enough flags
      prisma.review.update({
        where: { id: reviewId },
        data: {
          status: 'flagged',
        },
      }),
    ]);

    // Get flag count for this review
    const flagCount = await prisma.reviewFlag.count({
      where: {
        reviewId,
        status: 'pending',
      },
    });

    // If this is the first flag or if we've reached a threshold, notify moderators
    if (flagCount === 1 || flagCount === 3 || flagCount === 5) {
      const moderators = await prisma.moderator.findMany({
        select: { userId: true },
      });

      await prisma.notification.createMany({
        data: moderators.map((mod) => ({
          userId: mod.userId,
          type: 'REVIEW_FLAGGED',
          title: 'Review Flagged',
          message: `A review has been flagged ${flagCount} time${
            flagCount > 1 ? 's' : ''
          }. Reason: ${reason}`,
          data: {
            reviewId,
            flagCount,
            reason,
          },
        })),
      });
    }

    // If we've reached a high flag threshold, automatically hide the review
    if (flagCount >= 5) {
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          status: 'hidden',
          hiddenAt: new Date().toISOString(),
        },
      });

      // Notify the review author
      await prisma.notification.create({
        data: {
          userId: review.userId,
          type: 'REVIEW_HIDDEN',
          title: 'Review Hidden',
          message: 'Your review has been hidden due to multiple user reports.',
          data: {
            reviewId,
            flagCount,
          },
        },
      });
    }

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error flagging review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}