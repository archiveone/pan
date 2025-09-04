import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

import { MessagesView } from './messages-view';

export const metadata: Metadata = {
  title: 'Messages | GREIA',
  description: 'Chat with other users on the GREIA platform',
};

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

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

  return (
    <div className="container mx-auto py-6">
      <MessagesView 
        initialConversations={conversations}
        currentUserId={session.user.id}
      />
    </div>
  );
}