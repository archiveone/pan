import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get likes for a post
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get likes with user info
    const likes = await prisma.like.findMany({
      where: { postId: params.postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.like.count({
      where: { postId: params.postId }
    });

    // Check if current user has liked the post
    const userLike = await prisma.like.findFirst({
      where: {
        postId: params.postId,
        userId: session.user.id
      }
    });

    return NextResponse.json({
      likes,
      hasLiked: !!userLike,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: 'Error fetching likes' },
      { status: 500 }
    );
  }
}

// Toggle like on a post
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId: params.postId,
        userId: session.user.id
      }
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { postId: params.postId }
      });

      return NextResponse.json({
        liked: false,
        likeCount
      });
    } else {
      // Like the post
      const like = await prisma.like.create({
        data: {
          postId: params.postId,
          userId: session.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true
            }
          }
        }
      });

      // Get post author
      const post = await prisma.post.findUnique({
        where: { id: params.postId },
        select: { authorId: true }
      });

      // Create notification for post author
      if (post && post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'like',
            content: \`\${session.user.name} liked your post\`,
            userId: post.authorId,
            postId: params.postId,
            senderId: session.user.id
          }
        });
      }

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { postId: params.postId }
      });

      return NextResponse.json({
        like,
        liked: true,
        likeCount
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Error toggling like' },
      { status: 500 }
    );
  }
}