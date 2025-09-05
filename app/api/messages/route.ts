import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pusher } from '@/lib/pusher';

// Get messages for a thread
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    let messages;
    if (threadId) {
      // Get messages for a specific thread
      messages = await prisma.message.findMany({
        where: {
          threadId,
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true
            }
          },
          receiver: {
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
    } else if (userId) {
      // Get or create thread between two users
      const thread = await getOrCreateThread(session.user.id, userId);
      
      messages = await prisma.message.findMany({
        where: {
          threadId: thread.id
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true
            }
          },
          receiver: {
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
    } else {
      // Get all threads for the user
      const threads = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
        },
        distinct: ['threadId'],
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true
            }
          },
          receiver: {
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
        }
      });

      return NextResponse.json({ threads });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Error fetching messages' },
      { status: 500 }
    );
  }
}

// Send a new message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, content, type = 'text', fileUrl } = body;

    // Get or create thread
    const thread = await getOrCreateThread(session.user.id, receiverId);

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        type,
        fileUrl,
        threadId: thread.id,
        senderId: session.user.id,
        receiverId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'message',
        content: \`New message from \${session.user.name}\`,
        userId: receiverId,
        senderId: session.user.id
      }
    });

    // Trigger real-time update
    await pusher.trigger(\`private-user-\${receiverId}\`, 'new-message', {
      message,
      thread: thread.id
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Error sending message' },
      { status: 500 }
    );
  }
}

// Mark messages as read
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { threadId } = body;

    // Update all unread messages in thread
    await prisma.message.updateMany({
      where: {
        threadId,
        receiverId: session.user.id,
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Error marking messages as read' },
      { status: 500 }
    );
  }
}

// Helper function to get or create a thread between two users
async function getOrCreateThread(userId1: string, userId2: string) {
  // Look for existing thread
  const existingThread = await prisma.message.findFirst({
    where: {
      OR: [
        {
          AND: [
            { senderId: userId1 },
            { receiverId: userId2 }
          ]
        },
        {
          AND: [
            { senderId: userId2 },
            { receiverId: userId1 }
          ]
        }
      ]
    },
    select: {
      threadId: true
    }
  });

  if (existingThread?.threadId) {
    return { id: existingThread.threadId };
  }

  // Create new thread ID
  const newThreadId = \`thread_\${userId1}_\${userId2}_\${Date.now()}\`;
  return { id: newThreadId };
}