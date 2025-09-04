import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

import { ChatInterface } from '@/components/messages/chat-interface';

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export async function generateMetadata(
  { params }: ConversationPageProps
): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      title: 'Messages | GREIA',
    };
  }

  const conversation = await prismadb.conversation.findFirst({
    where: {
      id: params.conversationId,
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
        }
      }
    }
  });

  if (!conversation) {
    return {
      title: 'Messages | GREIA',
    };
  }

  const otherUser = conversation.users.find(user => user.id !== session.user.id);

  return {
    title: `Chat with ${otherUser?.name || 'User'} | GREIA`,
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get conversation and verify access
  const conversation = await prismadb.conversation.findFirst({
    where: {
      id: params.conversationId,
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
    notFound();
  }

  const otherUser = conversation.users.find(user => user.id !== session.user.id);

  if (!otherUser) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatInterface
        conversationId={conversation.id}
        otherUser={otherUser}
        initialMessages={conversation.messages}
      />
    </div>
  );
}