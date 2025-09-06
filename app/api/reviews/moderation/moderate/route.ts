import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReviewModerationRequest } from '@/lib/types/reviewModeration';
import { OpenAI } from '@/lib/openai';

const openai = new OpenAI();

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

    // Check if user is a moderator
    const moderator = await prisma.moderator.findUnique({
      where: { userId: session.user.id },
    });

    if (!moderator) {
      return NextResponse.json(
        { error: 'Not authorized to moderate reviews' },
        { status: 403 }
      );
    }

    const body: ReviewModerationRequest = await request.json();
    const { reviewId, action, reason, moderatorNote } = body;

    // Get the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        flags: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // If the review is already moderated, check if it can be re-moderated
    if (review.status !== 'pending' && review.status !== 'flagged') {
      return NextResponse.json(
        { error: 'Review has already been moderated' },
        { status: 400 }
      );
    }

    // Perform AI analysis if needed
    let aiAnalysis;
    if (action === 'approve') {
      aiAnalysis = await openai.analyzeReview({
        title: review.title,
        content: review.content,
      });

      // Check if AI analysis flags any issues
      if (
        aiAnalysis.toxicity > 0.7 ||
        aiAnalysis.spam_probability > 0.7 ||
        aiAnalysis.fake_probability > 0.7 ||
        Object.values(aiAnalysis.content_flags).some(flag => flag)
      ) {
        return NextResponse.json(
          {
            error: 'AI analysis detected potential issues with this review',
            aiAnalysis,
          },
          { status: 400 }
        );
      }
    }

    // Update review status
    const updatedReview = await prisma.$transaction(async (prisma) => {
      // Update review
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          moderatedAt: new Date().toISOString(),
          moderatorId: session.user.id,
        },
      });

      // Create moderation log
      await prisma.moderationLog.create({
        data: {
          reviewId,
          moderatorId: session.user.id,
          action,
          reason,
          note: moderatorNote,
        },
      });

      // If review was flagged, resolve all pending flags
      if (review.flags.length > 0) {
        await prisma.reviewFlag.updateMany({
          where: {
            reviewId,
            status: 'pending',
          },
          data: {
            status: 'resolved',
            resolution: {
              action,
              moderatorId: session.user.id,
              note: moderatorNote || '',
              timestamp: new Date().toISOString(),
            },
          },
        });
      }

      // If rejecting, notify the review author
      if (action === 'reject') {
        await prisma.notification.create({
          data: {
            userId: review.userId,
            type: 'REVIEW_REJECTED',
            title: 'Review Rejected',
            message: reason || 'Your review has been rejected by a moderator.',
            data: {
              reviewId,
              reason,
            },
          },
        });
      }

      return updated;
    });

    // Store AI analysis if performed
    if (aiAnalysis) {
      await prisma.reviewAIAnalysis.create({
        data: {
          reviewId,
          ...aiAnalysis,
        },
      });
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}