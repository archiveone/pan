'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import Pusher from 'pusher-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

interface User {
  id: string;
  name: string;
  image: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
  recipientId?: string;
  initialMessages?: Message[];
  otherUser?: User;
}

export const ChatInterface = ({
  conversationId,
  recipientId,
  initialMessages = [],
  otherUser,
}: ChatInterfaceProps) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Set up real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        endpoint: '/api/pusher/auth',
        transport: 'ajax',
      },
    });

    const channel = pusher.subscribe(`private-user-${session.user.id}`);
    
    channel.bind('new-message', (data: { message: Message }) => {
      if (data.message.conversationId === conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.id, conversationId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    try {
      setLoading(true);
      
      const response = await axios.post('/api/messages', {
        content: newMessage,
        ...(conversationId ? { conversationId } : { recipientId }),
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Header */}
      {otherUser && (
        <div className="p-4 border-b flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.image} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.user.id === session?.user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.image} alt={message.user.name} />
                    <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-md break-words ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};