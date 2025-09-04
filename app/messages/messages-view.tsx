'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatInterface } from '@/components/messages/chat-interface';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface User {
  id: string;
  name: string;
  image: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface Conversation {
  id: string;
  users: User[];
  messages: Message[];
  updatedAt: string;
}

interface MessagesViewProps {
  initialConversations: Conversation[];
  currentUserId: string;
}

export const MessagesView = ({
  initialConversations,
  currentUserId,
}: MessagesViewProps) => {
  const [conversations, setConversations] = useState(initialConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle conversation selection from URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [searchParams, conversations]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const otherUser = conversation.users.find(user => user.id !== currentUserId);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherUser = (conversation: Conversation) => {
    return conversation.users.find(user => user.id !== currentUserId);
  };

  const getLastMessage = (conversation: Conversation) => {
    return conversation.messages[0];
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    router.push(`/messages?conversation=${conversation.id}`, { scroll: false });
  };

  const handleNewMessage = (userId: string) => {
    setNewMessageDialogOpen(false);
    // The ChatInterface component will handle creating a new conversation
    router.push(`/messages?recipient=${userId}`);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Conversations List */}
      <div className="w-80 border-r">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Dialog open={newMessageDialogOpen} onOpenChange={setNewMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {/* User search results would go here */}
                      <CommandItem onSelect={() => handleNewMessage("user-id")}>
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                        <span>User Name</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2 p-2">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const lastMessage = getLastMessage(conversation);

              if (!otherUser) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherUser.image} alt={otherUser.name} />
                      <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold truncate">{otherUser.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.user.id === currentUserId ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatInterface
            conversationId={selectedConversation.id}
            otherUser={getOtherUser(selectedConversation)}
            initialMessages={selectedConversation.messages}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
};