import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

// Send a message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      content,
      conversationId,
      recipientId 
    } = body;

    if (!content) {
      return new NextResponse("Message content is required", { status: 400 });
    }

    let conversation;

    if (conversationId) {
      // Verify user is part of the conversation
      conversation = await prismadb.conversation.findFirst({
        where: {
          id: conversationId,
          users: {
            some: {
              id: session.user.id
            }
          }
        },
        include: {
          users: true
        }
      });

      if (!conversation) {
        return new NextResponse("Conversation not found", { status: 404 });
      }
    } else if (recipientId) {
      // Check if conversation already exists between these users
      conversation = await prismadb.conversation.findFirst({
        where: {
          AND: [
            {
              users: {
                some: {
                  id: session.user.id
                }
              }
            },
            {
              users: {
                some: {
                  id: recipientId
                }
              }
            }
          ]
        },
        include: {
          users: true
        }
      });

      // Create new conversation if it doesn't exist
      if (!conversation) {
        conversation = await prismadb.conversation.create({
          data: {
            users: {
              connect: [
                { id: session.user.id },
                { id: recipientId }
              ]
            }
          },
          include: {
            users: true
          }
        });
      }
    } else {
      return new NextResponse("Either conversationId or recipientId is required", { status: 400 });
    }

    // Create the message
    const message = await prismadb.message.create({
      data: {
        content,
        userId: session.user.id,
        conversationId: conversation.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    // Update conversation's updatedAt
    await prismadb.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // Notify other conversation participants
    const otherUsers = conversation.users.filter(user => user.id !== session.user.id);
    
    for (const user of otherUsers) {
      await pusherServer.trigger(`private-user-${user.id}`, 'new-message', {
        message: {
          ...message,
          conversationId: conversation.id,
          senderName: session.user.name,
        }
      });

      // Create notification
      await prismadb.notification.create({
        data: {
          userId: user.id,
          type: 'MESSAGE',
          title: 'New Message',
          content: `${session.user.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          link: `/messages/${conversation.id}`,
          senderId: session.user.id,
        }
      });

      // Notify about new notification
      await pusherServer.trigger(`private-user-${user.id}`, 'new-notification', {
        message: 'You have a new message'
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('[MESSAGE_SEND]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get conversations
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get messages for a specific conversation
      const conversation = await prismadb.conversation.findFirst({
        where: {
          id: conversationId,
          users: {
            some: {
              id: session.user.id
            }
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          messages: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (!conversation) {
        return new NextResponse("Conversation not found", { status: 404 });
      }

      return NextResponse.json(conversation);
    } else {
      // Get all conversations for the user
      const conversations = await prismadb.conversation.findMany({
        where: {
          users: {
            some: {
              id: session.user.id
            }
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('[CONVERSATIONS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}