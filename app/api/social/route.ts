import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/social/feed - Get social feed posts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get feed posts with engagement metrics
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          // Posts from followed users
          {
            author: {
              followers: {
                some: { id: session.user.id }
              }
            }
          },
          // User's own posts
          { authorId: session.user.id },
          // Posts with high engagement in user's area
          {
            author: {
              city: {
                equals: session.user.city
              }
            },
            _count: {
              likes: {
                gt: 5
              }
            }
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            category: true,
            type: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
        // Include if current user has liked
        likes: {
          where: {
            userId: session.user.id
          },
          select: {
            id: true
          }
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { 
          likes: {
            _count: 'desc'
          }
        }
      ],
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.post.count({
      where: {
        OR: [
          { authorId: session.user.id },
          {
            author: {
              followers: {
                some: { id: session.user.id }
              }
            }
          }
        ]
      }
    });

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        isLiked: post.likes.length > 0,
        likes: undefined, // Remove likes array from response
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

// POST /api/social/post - Create a new post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Basic validation
    if (!data.content && !data.listingId) {
      return NextResponse.json(
        { error: 'Post must contain content or reference a listing' },
        { status: 400 }
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        content: data.content,
        images: data.images || [],
        author: {
          connect: { id: session.user.id }
        },
        ...(data.listingId && {
          listing: {
            connect: { id: data.listingId }
          }
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            category: true,
            type: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// POST /api/social/post/[id]/like - Like/unlike a post
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId, action } = await request.json();

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (action === 'like') {
      // Create like if it doesn't exist
      await prisma.like.create({
        data: {
          post: {
            connect: { id: postId }
          },
          user: {
            connect: { id: session.user.id }
          }
        }
      });
    } else {
      // Remove like if it exists
      await prisma.like.deleteMany({
        where: {
          postId,
          userId: session.user.id
        }
      });
    }

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId }
    });

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Error updating post like:', error);
    return NextResponse.json(
      { error: 'Failed to update post like' },
      { status: 500 }
    );
  }
}

// POST /api/social/post/[id]/comment - Add a comment to a post
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId, content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        post: {
          connect: { id: postId }
        },
        author: {
          connect: { id: session.user.id }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}