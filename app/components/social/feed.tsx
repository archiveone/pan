'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Post {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  liked: boolean;
  user: {
    id: string;
    name: string;
    image: string;
  };
  property?: {
    title: string;
    price: number;
    location: string;
    images: string[];
  };
  listing?: {
    title: string;
    price: number;
    type: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface FeedProps {
  userId?: string;
  following?: boolean;
  propertyId?: string;
  listingId?: string;
}

export const Feed = ({
  userId,
  following = false,
  propertyId,
  listingId,
}: FeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [ref, inView] = useInView();
  const router = useRouter();
  const { toast } = useToast();

  const fetchPosts = async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (following) params.append('following', 'true');
      if (propertyId) params.append('propertyId', propertyId);
      if (listingId) params.append('listingId', listingId);
      if (cursor) params.append('cursor', cursor);

      const response = await axios.get(`/api/social/posts?${params.toString()}`);
      const { posts: newPosts, nextCursor: newCursor } = response.data;

      if (cursor) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setNextCursor(newCursor);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load posts. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId, following, propertyId, listingId]);

  useEffect(() => {
    if (inView && nextCursor) {
      fetchPosts(nextCursor);
    }
  }, [inView]);

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const action = post.liked ? 'UNLIKE' : 'LIKE';
      await axios.post('/api/social/interactions', {
        postId,
        action,
      });

      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            liked: !p.liked,
            _count: {
              ...p._count,
              likes: p._count.likes + (action === 'LIKE' ? 1 : -1),
            },
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not process your action. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user.image} alt={post.user.name} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  <button 
                    onClick={() => router.push(`/profile/${post.user.id}`)}
                    className="hover:underline"
                  >
                    {post.user.name}
                  </button>
                </CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
            
            {post.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Post image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}

            {post.property && (
              <Card className="mt-4 cursor-pointer hover:bg-accent/50 transition"
                    onClick={() => router.push(`/properties/${post.property?.id}`)}>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="relative h-20 w-20">
                      <Image
                        src={post.property.images[0]}
                        alt={post.property.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{post.property.title}</h4>
                      <p className="text-sm text-muted-foreground">{post.property.location}</p>
                      <p className="font-medium">£{post.property.price.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {post.listing && (
              <Card className="mt-4 cursor-pointer hover:bg-accent/50 transition"
                    onClick={() => router.push(`/listings/${post.listing?.id}`)}>
                <CardContent className="p-4">
                  <div>
                    <h4 className="font-semibold">{post.listing.title}</h4>
                    <p className="text-sm text-muted-foreground">{post.listing.type}</p>
                    <p className="font-medium">£{post.listing.price.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className="space-x-2"
                onClick={() => handleLike(post.id)}
              >
                <Heart className={post.liked ? "fill-red-500 stroke-red-500" : ""} />
                <span>{post._count.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="space-x-2"
                onClick={() => router.push(`/posts/${post.id}`)}
              >
                <MessageCircle />
                <span>{post._count.comments}</span>
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      {nextCursor && (
        <div ref={ref} className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-lg font-medium">No posts to show</p>
            <p className="text-sm text-muted-foreground">
              {following ? "Follow more people to see their posts" : "Be the first to post something"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};