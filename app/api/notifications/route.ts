import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pusher } from '@/lib/pusher';

// Get notifications for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const skip = (page - 1) * limit;

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {})
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {})
      }
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error fetching notifications' },
      { status: 500 }
    );
  }
}

// Create a new notification
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, type, content, postId, commentId, senderId } = body;

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        content,
        postId,
        commentId,
        senderId: senderId || session.user.id
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

    // Trigger real-time notification
    await pusher.trigger(\`private-user-\${userId}\`, 'new-notification', {
      notification
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Error creating notification' },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: session.user.id
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Error marking notifications as read' },
      { status: 500 }
    );
  }
}

// Delete notifications
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationIds = searchParams.get('ids')?.split(',');

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    // Delete notifications
    await prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Error deleting notifications' },
      { status: 500 }
    );
  }
}