import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// POST /api/messages - Send a new message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, receiverId } = body;

    // Validate required fields
    if (!content || !receiverId) {
      return NextResponse.json(
        { error: 'Content and receiver are required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            id: {
              in: [session.user.id, receiverId],
            },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: session.user.id },
              { id: receiverId },
            ],
          },
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId: conversation.id,
        senderId: session.user.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update conversation's last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessageId: message.id,
      },
    });

    // Trigger real-time update for receiver
    await pusher.trigger(`private-user-${receiverId}`, 'new-message', message);

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        title: 'New Message',
        message: `New message from ${session.user.name || session.user.email}`,
        isRead: false,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET /api/messages/conversations - Get user's conversations
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
            read: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: session.user.id,
            read: false,
          },
        });

        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0],
        };
      })
    );

    return NextResponse.json(conversationsWithUnreadCount);
  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}