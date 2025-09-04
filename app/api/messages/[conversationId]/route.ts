import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/messages/[conversationId] - Get messages for a specific conversation
export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get messages with sender info
    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages/[conversationId]/read - Mark messages as read
export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Mark all unread messages as read
    const { count } = await prisma.message.updateMany({
      where: {
        conversationId: params.conversationId,
        receiverId: session.user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Get IDs of updated messages
    const updatedMessages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
        receiverId: session.user.id,
        read: true,
        readAt: {
          not: null,
        },
      },
      select: {
        id: true,
        senderId: true,
      },
    });

    // Group messages by sender and trigger real-time updates
    const messagesBySender = updatedMessages.reduce((acc, msg) => {
      if (!acc[msg.senderId]) {
        acc[msg.senderId] = [];
      }
      acc[msg.senderId].push(msg.id);
      return acc;
    }, {} as Record<string, string[]>);

    // Notify senders that their messages were read
    for (const [senderId, messageIds] of Object.entries(messagesBySender)) {
      await pusher.trigger(
        `private-user-${senderId}`,
        'message-read',
        { messageIds }
      );
    }

    return NextResponse.json({
      message: `Marked ${count} messages as read`,
      updatedMessages: updatedMessages.map(m => m.id),
    });
  } catch (error) {
    console.error('Message read status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update message read status' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/[conversationId] - Delete conversation
export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Soft delete conversation for the current user
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: params.conversationId,
          userId: session.user.id,
        },
      },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    // Check if all participants have deleted the conversation
    const remainingParticipants = await prisma.conversationParticipant.count({
      where: {
        conversationId: params.conversationId,
        deleted: false,
      },
    });

    // If no participants remain, hard delete the conversation and its messages
    if (remainingParticipants === 0) {
      await prisma.message.deleteMany({
        where: {
          conversationId: params.conversationId,
        },
      });

      await prisma.conversation.delete({
        where: {
          id: params.conversationId,
        },
      });
    }

    return NextResponse.json({
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('Conversation deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}