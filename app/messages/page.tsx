'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import Pusher from 'pusher-js';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    email: string;
    image?: string;
  }[];
  lastMessage?: {
    content: string;
    createdAt: Date;
    senderId: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to user's private channel
    const channel = pusher.subscribe(`private-user-${session.user.id}`);
    
    // Handle new messages
    channel.bind('new-message', (data: Message) => {
      if (activeConversation === data.senderId) {
        setMessages(prev => [...prev, data]);
      }
      // Update conversation list
      fetchConversations();
    });

    // Handle message read status
    channel.bind('message-read', (data: { messageIds: string[] }) => {
      setMessages(prev =>
        prev.map(msg =>
          data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );
    });

    return () => {
      pusher.unsubscribe(`private-user-${session.user.id}`);
    };
  }, [session, activeConversation]);

  useEffect(() => {
    fetchConversations();
  }, [session]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      setActiveConversation(conversationId);
      
      // Mark messages as read
      markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: activeConversation,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setNewMessage('');
      // Message will be added through Pusher
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Conversations List */}
        <div className="w-1/3 flex flex-col">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Card className="flex-1 overflow-y-auto">
            <CardContent className="p-4 space-y-2">
              {isLoading ? (
                <div>Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center text-gray-500">No conversations found</div>
              ) : (
                filteredConversations.map(conv => {
                  const otherParticipant = conv.participants.find(
                    p => p.id !== session?.user?.id
                  );
                  return (
                    <div
                      key={conv.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                        activeConversation === conv.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => fetchMessages(conv.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant?.image} />
                        <AvatarFallback>
                          {otherParticipant?.name?.[0] || otherParticipant?.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {otherParticipant?.name || otherParticipant?.email}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === session?.user?.id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === session?.user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                          {message.senderId === session?.user?.id && (
                            <span className="text-xs">
                              {message.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}