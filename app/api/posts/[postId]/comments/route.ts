import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get comments for a post
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get comments with author info
    const comments = await prisma.comment.findMany({
      where: { postId: params.postId },
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
            replies: true
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
    const totalCount = await prisma.comment.count({
      where: { postId: params.postId }
    });

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    );
  }
}

// Add a comment
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
    const { content, parentId } = body;

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: params.postId,
        authorId: session.user.id,
        parentId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        }
      }
    });

    // If this is a reply, notify the parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true }
      });

      if (parentComment && parentComment.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'comment_reply',
            content: \`\${session.user.name} replied to your comment\`,
            userId: parentComment.authorId,
            postId: params.postId,
            commentId: comment.id,
            senderId: session.user.id
          }
        });
      }
    } else {
      // Notify post author of new comment
      const post = await prisma.post.findUnique({
        where: { id: params.postId },
        select: { authorId: true }
      });

      if (post && post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'comment',
            content: \`\${session.user.name} commented on your post\`,
            userId: post.authorId,
            postId: params.postId,
            commentId: comment.id,
            senderId: session.user.id
          }
        });
      }
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Error creating comment' },
      { status: 500 }
    );
  }
}

// Update a comment
export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { commentId, content } = body;

    // Check if user is the author
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment || existingComment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this comment' },
        { status: 403 }
      );
    }

    // Update comment
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Error updating comment' },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Check if user is the author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment || comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }

    // Delete comment and its replies
    await prisma.$transaction([
      prisma.comment.deleteMany({
        where: { parentId: commentId }
      }),
      prisma.comment.delete({
        where: { id: commentId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Error deleting comment' },
      { status: 500 }
    );
  }
}