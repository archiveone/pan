import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

// Like/Unlike a post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { postId, action } = body;

    if (!postId || !action) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get post and verify it exists
    const post = await prismadb.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    switch (action) {
      case 'LIKE':
        // Create like if it doesn't exist
        const like = await prismadb.like.create({
          data: {
            userId: session.user.id,
            postId,
          }
        }).catch(() => null); // Catch unique constraint violation

        if (like && post.userId !== session.user.id) {
          // Notify post owner of new like
          await pusherServer.trigger(`private-user-${post.userId}`, 'new-like', {
            message: `${session.user.name} liked your post`,
            postId,
            userName: session.user.name,
          });
        }

        return NextResponse.json({ liked: true });

      case 'UNLIKE':
        // Delete like if it exists
        await prismadb.like.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId,
            }
          }
        }).catch(() => null);

        return NextResponse.json({ liked: false });

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error('[LIKE_ACTION]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add comment to a post
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { postId, content } = body;

    if (!postId || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get post and verify it exists
    const post = await prismadb.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Create comment
    const comment = await prismadb.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    if (post.userId !== session.user.id) {
      // Notify post owner of new comment
      await pusherServer.trigger(`private-user-${post.userId}`, 'new-comment', {
        message: `${session.user.name} commented on your post`,
        postId,
        commentId: comment.id,
        userName: session.user.name,
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('[COMMENT_CREATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Follow/Unfollow a user
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (userId === session.user.id) {
      return new NextResponse("Cannot follow yourself", { status: 400 });
    }

    // Verify target user exists
    const targetUser = await prismadb.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
      }
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    switch (action) {
      case 'FOLLOW':
        // Create follow relationship if it doesn't exist
        const follow = await prismadb.follow.create({
          data: {
            followerId: session.user.id,
            followingId: userId,
          }
        }).catch(() => null); // Catch unique constraint violation

        if (follow) {
          // Notify user of new follower
          await pusherServer.trigger(`private-user-${userId}`, 'new-follower', {
            message: `${session.user.name} started following you`,
            followerId: session.user.id,
            followerName: session.user.name,
          });
        }

        return NextResponse.json({ following: true });

      case 'UNFOLLOW':
        // Delete follow relationship if it exists
        await prismadb.follow.delete({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: userId,
            }
          }
        }).catch(() => null);

        return NextResponse.json({ following: false });

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error('[FOLLOW_ACTION]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}