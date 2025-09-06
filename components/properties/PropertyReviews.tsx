"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PropertyReviewsProps {
  propertyId: string;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    user: {
      name: string;
      image?: string;
    };
  }>;
  onSuccess?: () => void;
}

const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export function PropertyReviews({ propertyId, reviews, onSuccess }: PropertyReviewsProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  async function onSubmit(data: z.infer<typeof reviewFormSchema>) {
    if (!session) {
      toast.error('Please sign in to leave a review');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/properties/${propertyId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      toast.success('Review submitted successfully');
      onSuccess?.();
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const averageRating = reviews.length
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Reviews</h3>
          <p className="text-sm text-muted-foreground">
            {reviews.length} reviews, {averageRating.toFixed(1)} average
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Write a Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience with this property
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'p-0 hover:bg-transparent',
                                rating <= field.value && 'text-yellow-500'
                              )}
                              onClick={() => field.onChange(rating)}
                            >
                              <StarIcon className="h-5 w-5 fill-current" />
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{review.user.name}</div>
                <div className="flex items-center text-yellow-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(review.createdAt), 'PP')}
              </div>
            </div>
            <p className="text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}