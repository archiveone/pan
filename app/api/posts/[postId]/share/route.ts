import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get shares for a post
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

    // Get shares with user info
    const shares = await prisma.share.findMany({
      where: { postId: params.postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        },
        post: {
          select: {
            id: true,
            content: true,
            media: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        sharedAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.share.count({
      where: { postId: params.postId }
    });

    return NextResponse.json({
      shares,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching shares:', error);
    return NextResponse.json(
      { error: 'Error fetching shares' },
      { status: 500 }
    );
  }
}

// Share a post
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body; // Optional comment when sharing

    // Check if post exists
    const originalPost = await prisma.post.findUnique({
      where: { id: params.postId },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!originalPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create share and new post
    const [share, newPost] = await prisma.$transaction([
      // Create share record
      prisma.share.create({
        data: {
          postId: params.postId,
          userId: session.user.id,
          content
        }
      }),
      // Create new post as share
      prisma.post.create({
        data: {
          content: content || '',
          authorId: session.user.id,
          type: 'share',
          originalPostId: params.postId
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true
            }
          },
          originalPost: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  username: true
                }
              },
              media: true
            }
          }
        }
      })
    ]);

    // Create notification for original post author
    if (originalPost.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: 'share',
          content: \`\${session.user.name} shared your post\`,
          userId: originalPost.authorId,
          postId: params.postId,
          senderId: session.user.id
        }
      });
    }

    return NextResponse.json({
      share,
      post: newPost
    });
  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json(
      { error: 'Error sharing post' },
      { status: 500 }
    );
  }
}

// Delete a share
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the share
    const share = await prisma.share.findFirst({
      where: {
        postId: params.postId,
        userId: session.user.id
      }
    });

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    // Delete share and associated post
    await prisma.$transaction([
      prisma.post.deleteMany({
        where: {
          authorId: session.user.id,
          type: 'share',
          originalPostId: params.postId
        }
      }),
      prisma.share.delete({
        where: {
          id: share.id
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting share:', error);
    return NextResponse.json(
      { error: 'Error deleting share' },
      { status: 500 }
    );
  }
}