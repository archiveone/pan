import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Play
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Author {
  id: string;
  name: string;
  username: string;
  image: string | null;
  verified: boolean;
}

interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface FeedPostProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    author: Author;
    media: Media[];
    _count: {
      likes: number;
      comments: number;
      shares: number;
    };
    liked: boolean;
    bookmarked: boolean;
    type?: 'share';
    originalPost?: {
      id: string;
      content: string;
      author: Author;
      media: Media[];
    };
  };
  comments?: Comment[];
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onShare: (postId: string, content?: string) => Promise<void>;
  onBookmark: (postId: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
}

export function FeedPost({
  post,
  comments,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onDelete
}: FeedPostProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarked);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      await onLike(post.id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await onComment(post.id, newComment);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await onShare(post.id);
      toast.success('Post shared');
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  const handleBookmark = async () => {
    try {
      await onBookmark(post.id);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Post removed from bookmarks' : 'Post bookmarked');
    } catch (error) {
      toast.error('Failed to bookmark post');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete(post.id);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <Card className="p-4">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Link href={\`/profile/\${post.author.username}\`}>
            <Avatar>
              <AvatarImage src={post.author.image || ''} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center space-x-1">
              <Link
                href={\`/profile/\${post.author.username}\`}
                className="font-semibold hover:underline"
              >
                {post.author.name}
              </Link>
              {post.author.verified && <VerifiedBadge />}
            </div>
            <div className="text-sm text-gray-500">
              @{post.author.username} ·{' '}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {session?.user?.id === post.author.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="whitespace-pre-wrap">{post.content}</p>

        {/* Shared Post */}
        {post.type === 'share' && post.originalPost && (
          <Card className="mt-3 p-3 border">
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="w-6 h-6">
                <AvatarImage
                  src={post.originalPost.author.image || ''}
                  alt={post.originalPost.author.name}
                />
                <AvatarFallback>
                  {post.originalPost.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">
                  {post.originalPost.author.name}
                </span>
                {post.originalPost.author.verified && <VerifiedBadge />}
              </div>
            </div>
            <p className="text-sm">{post.originalPost.content}</p>
            {post.originalPost.media.length > 0 && (
              <div className="mt-2">
                <MediaGrid media={post.originalPost.media} />
              </div>
            )}
          </Card>
        )}

        {/* Media */}
        {post.media.length > 0 && (
          <div className="mt-3">
            <MediaGrid media={post.media} />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={isLiked ? 'text-red-500' : ''}
        >
          <Heart className={\`h-4 w-4 \${isLiked ? 'fill-current' : ''}\`} />
          <span className="ml-1">{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="ml-1">{post._count.comments}</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share className="h-4 w-4" />
          <span className="ml-1">{post._count.shares}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={isBookmarked ? 'text-blue-500' : ''}
        >
          <Bookmark className={\`h-4 w-4 \${isBookmarked ? 'fill-current' : ''}\`} />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="flex space-x-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={1}
            />
            <Button
              onClick={handleComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              Post
            </Button>
          </div>

          {comments?.map((comment) => (
            <div key={comment.id} className="flex space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={comment.author.image || ''}
                  alt={comment.author.name}
                />
                <AvatarFallback>
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{comment.author.name}</span>
                  {comment.author.verified && <VerifiedBadge />}
                  <span className="text-sm text-gray-500">
                    · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function MediaGrid({ media }: { media: Media[] }) {
  const getGridClass = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2';
      default: return 'grid-cols-2';
    }
  };

  return (
    <div className={\`grid \${getGridClass(media.length)} gap-2\`}>
      {media.map((item, index) => (
        <div
          key={item.id}
          className={\`relative \${
            media.length === 3 && index === 0 ? 'row-span-2' : ''
          }\`}
        >
          {item.type === 'image' ? (
            <Image
              src={item.url}
              alt=""
              width={item.width || 400}
              height={item.height || 400}
              className="rounded-lg object-cover w-full h-full"
            />
          ) : (
            <div className="relative rounded-lg overflow-hidden">
              <video
                src={item.url}
                poster={item.thumbnailUrl}
                controls
                className="w-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-12 w-12 text-white opacity-75" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}