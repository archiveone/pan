'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Heart,
  Share,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  MapPin,
  Users,
  Search,
  Bell,
  UserPlus,
  ThumbsUp,
  MessageSquare,
  Send,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sample user data
const currentUser = {
  id: 1,
  name: 'John Doe',
  username: '@johndoe',
  avatar: '/images/users/user-1.jpg',
  bio: 'Property investor & developer',
  followers: 1234,
  following: 567,
  posts: 89,
};

// Sample posts data
const posts = [
  {
    id: 1,
    user: {
      id: 2,
      name: 'Sarah Wilson',
      username: '@sarahwilson',
      avatar: '/images/users/user-2.jpg',
      verified: true,
    },
    content: 'Just closed on this amazing property in Dublin! 🏠 #RealEstate #Investment',
    images: ['/images/posts/property-1.jpg'],
    timestamp: '2025-09-04T14:30:00Z',
    likes: 245,
    comments: 32,
    shares: 12,
    liked: false,
    saved: false,
    type: 'property',
    propertyDetails: {
      location: 'Dublin 4',
      price: '€750,000',
      type: 'Residential',
    },
  },
  // Add more posts...
];

// Sample suggested connections
const suggestedConnections = [
  {
    id: 1,
    name: 'Emma Thompson',
    username: '@emmathompson',
    avatar: '/images/users/user-3.jpg',
    bio: 'Real Estate Agent at Dublin Properties',
    mutualConnections: 15,
  },
  // Add more suggestions...
];

// Sample trending topics
const trendingTopics = [
  {
    tag: '#DublinProperty',
    posts: 1234,
  },
  {
    tag: '#RealEstateInvestment',
    posts: 890,
  },
  // Add more topics...
];

export default function ConnectPage() {
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('feed');

  const handlePostSubmit = async () => {
    // Implement post submission logic
    console.log('Submitting post:', { content: newPostContent, images: selectedImages });
    setNewPostContent('');
    setSelectedImages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/connect">
              <h1 className="text-xl font-bold">Connect</h1>
            </Link>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search connections..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar - User Profile */}
          <Card className="p-6 h-fit">
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{currentUser.name}</h2>
              <p className="text-muted-foreground">{currentUser.username}</p>
              <p className="mt-2">{currentUser.bio}</p>
            </div>
            <div className="grid grid-cols-3 text-center mb-6">
              <div>
                <div className="font-semibold">{currentUser.posts}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="font-semibold">{currentUser.followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="font-semibold">{currentUser.following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
            <Button className="w-full">Edit Profile</Button>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post */}
            <Card className="p-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      disabled={!newPostContent.trim()}
                      onClick={handlePostSubmit}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Posts Feed */}
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
                <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
                <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-4 mt-4">
                {posts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={post.user.avatar} alt={post.user.name} />
                          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{post.user.name}</span>
                            <span className="text-muted-foreground">
                              {post.user.username}
                            </span>
                            {post.user.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(post.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Save Post</DropdownMenuItem>
                          <DropdownMenuItem>Report Post</DropdownMenuItem>
                          <DropdownMenuItem>Unfollow User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="my-4">{post.content}</p>

                    {post.images?.length > 0 && (
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                        <Image
                          src={post.images[0]}
                          alt="Post image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {post.type === 'property' && post.propertyDetails && (
                      <Card className="p-4 mb-4 bg-muted">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{post.propertyDetails.type}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1" />
                              {post.propertyDetails.location}
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-primary">
                            {post.propertyDetails.price}
                          </div>
                        </div>
                      </Card>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={post.liked ? 'text-red-500' : ''}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="w-4 h-4 mr-2" />
                          {post.shares}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={post.saved ? 'text-primary' : ''}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Suggested Connections */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">People You May Know</h3>
              <div className="space-y-4">
                {suggestedConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={connection.avatar} alt={connection.name} />
                      <AvatarFallback>{connection.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{connection.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {connection.mutualConnections} mutual connections
                      </div>
                    </div>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trending Topics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.tag}
                    className="flex items-center justify-between"
                  >
                    <div className="font-medium text-primary">{topic.tag}</div>
                    <div className="text-sm text-muted-foreground">
                      {topic.posts} posts
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}