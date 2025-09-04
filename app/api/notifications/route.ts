import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// Get notifications
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const cursor = searchParams.get('cursor');
    const limit = 20;

    // Build where clause
    const where = {
      userId: session.user.id,
      ...(unreadOnly && { read: false }),
      ...(cursor && { createdAt: { lt: new Date(cursor) } })
    };

    // Get notifications with pagination
    const notifications = await prismadb.notification.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    // Get next cursor
    const nextCursor = notifications.length === limit
      ? notifications[notifications.length - 1].createdAt.toISOString()
      : null;

    // Get unread count
    const unreadCount = await prismadb.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      }
    });

    return NextResponse.json({
      notifications,
      nextCursor,
      unreadCount,
    });
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Mark notifications as read
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return new NextResponse("Invalid notification IDs", { status: 400 });
    }

    // Verify ownership of notifications
    const notifications = await prismadb.notification.findMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: session.user.id,
      }
    });

    if (notifications.length !== notificationIds.length) {
      return new NextResponse("Some notifications not found or unauthorized", { status: 403 });
    }

    // Mark notifications as read
    await prismadb.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: session.user.id,
      },
      data: {
        read: true,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS_MARK_READ]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete notifications
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return new NextResponse("Notification ID required", { status: 400 });
    }

    // Verify ownership and delete notification
    const notification = await prismadb.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      }
    });

    if (!notification) {
      return new NextResponse("Notification not found or unauthorized", { status: 403 });
    }

    await prismadb.notification.delete({
      where: {
        id: notificationId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATION_DELETE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update notification preferences
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== 'object') {
      return new NextResponse("Invalid preferences", { status: 400 });
    }

    // Update user's notification preferences
    const user = await prismadb.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        notificationPreferences: preferences,
      }
    });

    return NextResponse.json(user.notificationPreferences);
  } catch (error) {
    console.error('[NOTIFICATION_PREFERENCES_UPDATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}