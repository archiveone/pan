import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OpenAI } from '@/lib/openai';
import { ReviewModerationRequest } from '@/lib/types/reviewModeration';

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

    const body: {
      reviews: ReviewModerationRequest[];
      skipAICheck?: boolean;
    } = await request.json();

    const { reviews, skipAICheck } = body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: 'No reviews provided for moderation' },
        { status: 400 }
      );
    }

    // Process reviews in batches to avoid timeouts
    const batchSize = 10;
    const results = {
      success: [] as any[],
      failed: [] as any[],
      skipped: [] as any[],
    };

    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      
      // Process each review in the batch
      await Promise.all(
        batch.map(async (request) => {
          try {
            const { reviewId, action, reason, moderatorNote } = request;

            // Get the review
            const review = await prisma.review.findUnique({
              where: { id: reviewId },
              include: {
                flags: true,
              },
            });

            if (!review) {
              results.failed.push({
                reviewId,
                error: 'Review not found',
              });
              return;
            }

            // Skip if already moderated (unless it's flagged)
            if (review.status !== 'pending' && review.status !== 'flagged') {
              results.skipped.push({
                reviewId,
                reason: 'Already moderated',
              });
              return;
            }

            // Perform AI analysis if needed
            if (!skipAICheck && action === 'approve') {
              const aiAnalysis = await openai.analyzeReview({
                title: review.title,
                content: review.content,
              });

              // Skip if AI analysis flags issues
              if (
                aiAnalysis.toxicity > 0.7 ||
                aiAnalysis.spam_probability > 0.7 ||
                aiAnalysis.fake_probability > 0.7 ||
                Object.values(aiAnalysis.content_flags).some(flag => flag)
              ) {
                results.skipped.push({
                  reviewId,
                  reason: 'Failed AI check',
                  aiAnalysis,
                });
                return;
              }

              // Store AI analysis
              await prisma.reviewAIAnalysis.create({
                data: {
                  reviewId,
                  ...aiAnalysis,
                },
              });
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

            results.success.push(updatedReview);
          } catch (error) {
            console.error('Error processing review:', error);
            results.failed.push({
              reviewId: request.reviewId,
              error: 'Internal error',
            });
          }
        })
      );
    }

    // Create summary log
    await prisma.moderationLog.create({
      data: {
        moderatorId: session.user.id,
        action: 'bulk_moderate',
        note: `Bulk moderation: ${results.success.length} succeeded, ${results.failed.length} failed, ${results.skipped.length} skipped`,
      },
    });

    return NextResponse.json({
      summary: {
        total: reviews.length,
        succeeded: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
      results,
    });
  } catch (error) {
    console.error('Error in bulk moderation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}