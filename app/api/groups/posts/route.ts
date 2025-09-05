import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pusher } from '@/lib/pusher';

// Get group posts
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Check if user is a member
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member to view group posts' },
        { status: 403 }
      );
    }

    // Get posts with engagement metrics
    const posts = await prisma.groupPost.findMany({
      where: { groupId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.groupPost.count({
      where: { groupId }
    });

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        liked: post.likes.length > 0
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching group posts:', error);
    return NextResponse.json(
      { error: 'Error fetching group posts' },
      { status: 500 }
    );
  }
}

// Create group post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, content, images = [] } = body;

    // Check if user is a member
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group members can create posts' },
        { status: 403 }
      );
    }

    // Create post
    const post = await prisma.groupPost.create({
      data: {
        content,
        images,
        groupId,
        authorId: session.user.id
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
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      }
    });

    // Notify group members
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: {
          not: session.user.id
        }
      }
    });

    // Create notifications for all members
    await prisma.notification.createMany({
      data: groupMembers.map(member => ({
        type: 'group_post',
        content: \`New post in group by \${session.user.name}\`,
        userId: member.userId,
        senderId: session.user.id
      }))
    });

    // Trigger real-time update
    await pusher.trigger(\`private-group-\${groupId}\`, 'new-post', {
      post
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating group post:', error);
    return NextResponse.json(
      { error: 'Error creating group post' },
      { status: 500 }
    );
  }
}

// Update group post
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postId, content, images } = body;

    // Check if user is the author or admin
    const post = await prisma.groupPost.findUnique({
      where: { id: postId },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: session.user.id,
                role: 'admin'
              }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id && post.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Only the author or group admin can update this post' },
        { status: 403 }
      );
    }

    // Update post
    const updatedPost = await prisma.groupPost.update({
      where: { id: postId },
      data: {
        content,
        images
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
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      }
    });

    // Trigger real-time update
    await pusher.trigger(\`private-group-\${post.groupId}\`, 'post-updated', {
      post: updatedPost
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error updating group post:', error);
    return NextResponse.json(
      { error: 'Error updating group post' },
      { status: 500 }
    );
  }
}

// Delete group post
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

    // Check if user is the author or admin
    const post = await prisma.groupPost.findUnique({
      where: { id: postId },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: session.user.id,
                role: 'admin'
              }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id && post.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Only the author or group admin can delete this post' },
        { status: 403 }
      );
    }

    // Delete post and related data
    await prisma.$transaction([
      prisma.like.deleteMany({ where: { postId } }),
      prisma.comment.deleteMany({ where: { postId } }),
      prisma.share.deleteMany({ where: { postId } }),
      prisma.groupPost.delete({ where: { id: postId } })
    ]);

    // Trigger real-time update
    await pusher.trigger(\`private-group-\${post.groupId}\`, 'post-deleted', {
      postId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group post:', error);
    return NextResponse.json(
      { error: 'Error deleting group post' },
      { status: 500 }
    );
  }
}