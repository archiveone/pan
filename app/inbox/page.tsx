import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Pusher from 'pusher-js';
import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  Smile,
} from 'lucide-react';

// Initialize Pusher
const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    image: string;
    role: string;
    company: string;
    online: boolean;
  }[];
  lastMessage: Message;
  unreadCount: number;
}

export default function InboxPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Subscribe to user's conversation channel
    if (session?.user?.id) {
      const channel = pusher.subscribe(\`private-user-\${session.user.id}\`);
      
      channel.bind('new-message', (data: Message) => {
        // Update conversations with new message
        setConversations(prev => {
          const updated = [...prev];
          const conversationIndex = updated.findIndex(c => 
            c.id === data.senderId || c.id === data.receiverId
          );
          
          if (conversationIndex > -1) {
            updated[conversationIndex].lastMessage = data;
            updated[conversationIndex].unreadCount += 1;
          }
          
          return updated;
        });
      });

      // Cleanup subscription
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [session]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: message,
        }),
      });

      if (response.ok) {
        setMessage('');
        // Message will be added through Pusher
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-12 h-full">
              {/* Conversations List */}
              <div className="col-span-4 border-r">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Messages</CardTitle>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <div className="h-[calc(100%-8rem)] overflow-y-auto">
                  <AnimatePresence>
                    {conversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "p-4 cursor-pointer hover:bg-accent transition-colors",
                          selectedConversation?.id === conversation.id && "bg-accent"
                        )}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.participants[0].image} />
                              <AvatarFallback>
                                {conversation.participants[0].name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.participants[0].online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {conversation.participants[0].name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.lastMessage.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.content}
                            </p>
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {conversation.participants[0].role}
                              </Badge>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Chat Area */}
              <div className="col-span-8 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={selectedConversation.participants[0].image} />
                          <AvatarFallback>
                            {selectedConversation.participants[0].name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {selectedConversation.participants[0].name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedConversation.participants[0].role} at{' '}
                            {selectedConversation.participants[0].company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {/* Messages would be rendered here */}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <ImageIcon className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon">
                          <Smile className="h-5 w-5" />
                        </Button>
                        <Button onClick={handleSendMessage}>
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a conversation to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}