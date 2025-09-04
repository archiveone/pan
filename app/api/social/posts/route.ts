import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      content,
      images,
      propertyId,
      listingId 
    } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Create post with optional property/listing reference
    const post = await prismadb.post.create({
      data: {
        content,
        images: images || [],
        userId: session.user.id,
        ...(propertyId && { propertyId }),
        ...(listingId && { listingId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        property: {
          select: {
            title: true,
            price: true,
            location: true,
          }
        },
        listing: {
          select: {
            title: true,
            price: true,
            type: true,
          }
        }
      }
    });

    // Notify followers
    const followers = await prismadb.follow.findMany({
      where: {
        followingId: session.user.id
      },
      select: {
        followerId: true
      }
    });

    // Send notifications to followers
    for (const follower of followers) {
      await pusherServer.trigger(`private-user-${follower.followerId}`, 'new-post', {
        message: `${session.user.name} shared a new post`,
        postId: post.id,
        userName: session.user.name,
        userImage: session.user.image,
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('[POST_CREATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const following = searchParams.get('following') === 'true';
    const propertyId = searchParams.get('propertyId');
    const listingId = searchParams.get('listingId');
    const cursor = searchParams.get('cursor');
    const limit = 10;

    // Get user's following list if needed
    let followingIds: string[] = [];
    if (following) {
      const followingList = await prismadb.follow.findMany({
        where: {
          followerId: session.user.id
        },
        select: {
          followingId: true
        }
      });
      followingIds = followingList.map(f => f.followingId);
    }

    // Build where clause based on filters
    const where = {
      ...(userId && { userId }),
      ...(following && { userId: { in: [...followingIds, session.user.id] } }),
      ...(propertyId && { propertyId }),
      ...(listingId && { listingId }),
      ...(cursor && { createdAt: { lt: new Date(cursor) } })
    };

    // Get posts with pagination
    const posts = await prismadb.post.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        property: {
          select: {
            title: true,
            price: true,
            location: true,
            images: true,
          }
        },
        listing: {
          select: {
            title: true,
            price: true,
            type: true,
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      }
    });

    // Get like status for each post
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        const liked = await prismadb.like.findUnique({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: post.id,
            }
          }
        });
        return {
          ...post,
          liked: !!liked
        };
      })
    );

    // Get next cursor
    const nextCursor = posts.length === limit
      ? posts[posts.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      posts: postsWithLikeStatus,
      nextCursor
    });
  } catch (error) {
    console.error('[POSTS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}