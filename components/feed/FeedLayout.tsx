import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { CreatePostForm } from './CreatePostForm';
import { FeedPost } from './FeedPost';
import { TrendingTopics } from './TrendingTopics';
import { SuggestedConnections } from './SuggestedConnections';
import { Building2, Briefcase, Compass, Users } from 'lucide-react';

interface FeedLayoutProps {
  posts: any[];
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onShare: (postId: string, content?: string) => Promise<void>;
  onBookmark: (postId: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
}

export function FeedLayout({
  posts,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onDelete
}: FeedLayoutProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const filterPosts = (tab: string) => {
    switch (tab) {
      case 'properties':
        return posts.filter(post => post.type === 'property');
      case 'services':
        return posts.filter(post => post.type === 'service');
      case 'leisure':
        return posts.filter(post => post.type === 'leisure');
      case 'network':
        return posts.filter(post => post.type === 'network');
      default:
        return posts;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {/* Left Sidebar */}
      <div className="hidden lg:block">
        <Card className="sticky top-24 p-6 space-y-6">
          {/* User Profile Summary */}
          {session?.user && (
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{session.user.name}</h3>
                <p className="text-sm text-muted-foreground">@{session.user.username}</p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-2xl font-semibold">247</p>
              <p className="text-sm text-muted-foreground">Connections</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">52</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Building2 className="mr-2 h-4 w-4" />
              List Property
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Offer Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Compass className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </Card>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-2">
        {/* Create Post */}
        <Card className="mb-6 p-4">
          <div className="flex space-x-4">
            {session?.user && (
              <Avatar>
                <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
              <DialogTrigger asChild>
                <Input
                  placeholder="Share something professional..."
                  className="cursor-pointer bg-muted"
                  readOnly
                />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Post</DialogTitle>
                </DialogHeader>
                <CreatePostForm onSuccess={() => setIsPostModalOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Feed Filters */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="leisure">Leisure</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts */}
        <div className="space-y-6">
          {filterPosts(activeTab).map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
              onBookmark={onBookmark}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block">
        <div className="sticky top-24 space-y-6">
          {/* Trending Topics */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Trending in Your Network</h3>
            <TrendingTopics />
          </Card>

          {/* Suggested Connections */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Suggested Connections</h3>
            <SuggestedConnections />
          </Card>

          {/* Footer Links */}
          <div className="text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-2">
              <a href="#" className="hover:underline">About</a>
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Help</a>
            </div>
            <p className="mt-2">© 2025 GREIA. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}