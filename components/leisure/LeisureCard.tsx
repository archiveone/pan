import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Star, Calendar } from 'lucide-react';

interface LeisureCardProps {
  leisure: {
    id: string;
    title: string;
    description: string;
    type: 'RENTAL' | 'EXPERIENCE' | 'EVENT';
    price: number;
    location: string;
    status: string;
    isFeatured: boolean;
    availability: Date[];
    provider: {
      id: string;
      name: string;
      rating?: number;
      totalReviews: number;
      isVerified: boolean;
    };
    createdAt: Date;
  };
  showActions?: boolean;
  isOwner?: boolean;
}

export function LeisureCard({ leisure, showActions = false, isOwner = false }: LeisureCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/leisure?id=${leisure.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete listing');

      toast({
        title: 'Success',
        description: 'Your leisure listing has been deleted.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextAvailability = leisure.availability
    .filter(date => new Date(date) > new Date())
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

  const typeColors = {
    RENTAL: 'bg-blue-100 text-blue-800',
    EXPERIENCE: 'bg-purple-100 text-purple-800',
    EVENT: 'bg-green-100 text-green-800',
  };

  return (
    <Card className={leisure.isFeatured ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              <Link
                href={`/leisure/${leisure.id}`}
                className="hover:text-primary hover:underline"
              >
                {leisure.title}
              </Link>
            </h3>
            <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{leisure.location}</span>
              <span>•</span>
              <span>
                Posted {formatDistanceToNow(new Date(leisure.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {leisure.isFeatured && (
              <Badge variant="default">Featured</Badge>
            )}
            <Badge
              variant="secondary"
              className={typeColors[leisure.type]}
            >
              {leisure.type.charAt(0) + leisure.type.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">{leisure.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 text-yellow-400" />
              <span className="font-medium">
                {leisure.provider.rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({leisure.provider.totalReviews} reviews)
            </span>
            {leisure.provider.isVerified && (
              <Badge variant="secondary">Verified</Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">€{leisure.price.toFixed(2)}</div>
            {nextAvailability && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(nextAvailability).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {(showActions || isOwner) && (
        <CardFooter className="border-t pt-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {leisure.availability.length} available {leisure.availability.length === 1 ? 'time slot' : 'time slots'}
            </div>
            <div className="flex space-x-2">
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/leisure/edit/${leisure.id}`)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Delete
                  </Button>
                </>
              )}
              {!isOwner && showActions && (
                <Button
                  onClick={() => router.push(`/leisure/${leisure.id}`)}
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}