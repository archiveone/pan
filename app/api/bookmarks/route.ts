import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get user's bookmarks
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // Filter by post type
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id
    };
    if (type) {
      where.post = {
        type
      };
    }

    // Get bookmarks with post details
    const bookmarks = await prisma.savedPost.findMany({
      where,
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
                verified: true
              }
            },
            media: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                shares: true
              }
            },
            originalPost: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    username: true,
                    verified: true
                  }
                },
                media: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.savedPost.count({ where });

    // Get user's bookmark collections
    const collections = await prisma.bookmarkCollection.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return NextResponse.json({
      bookmarks,
      collections,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Error fetching bookmarks' },
      { status: 500 }
    );
  }
}

// Add bookmark
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postId, collectionIds = [] } = body;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create bookmark and add to collections
    const bookmark = await prisma.savedPost.create({
      data: {
        userId: session.user.id,
        postId,
        collections: {
          connect: collectionIds.map((id: string) => ({ id }))
        }
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
                verified: true
              }
            },
            media: true
          }
        },
        collections: true
      }
    });

    return NextResponse.json({ bookmark });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Error creating bookmark' },
      { status: 500 }
    );
  }
}

// Remove bookmark
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Delete bookmark
    await prisma.savedPost.deleteMany({
      where: {
        userId: session.user.id,
        postId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Error removing bookmark' },
      { status: 500 }
    );
  }
}