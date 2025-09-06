import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ServicePaymentModal } from './ServicePaymentModal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Star } from 'lucide-react';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    duration?: string;
    location: string;
    status: string;
    paidUntil?: Date;
    isFeatured: boolean;
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

export function ServiceCard({ service, showActions = false, isOwner = false }: ServiceCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleExtendListing = async (paymentIntentId: string) => {
    setIsPaymentModalOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: service.id,
          action: 'confirm_extension',
          paymentIntentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to extend service');

      toast({
        title: 'Success',
        description: 'Your service listing has been extended for another week.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to extend service listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const daysUntilExpiration = service.paidUntil
    ? Math.ceil((new Date(service.paidUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <>
      <Card className={service.isFeatured ? 'border-primary' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                <Link
                  href={`/services/${service.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {service.title}
                </Link>
              </h3>
              <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{service.location}</span>
                <span>•</span>
                <span>
                  Posted {formatDistanceToNow(new Date(service.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {service.isFeatured && (
                <Badge variant="default">Featured</Badge>
              )}
              <Badge variant="outline">{service.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-muted-foreground">{service.description}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-400" />
                <span className="font-medium">
                  {service.provider.rating?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({service.provider.totalReviews} reviews)
              </span>
              {service.provider.isVerified && (
                <Badge variant="secondary">Verified</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">€{service.price.toFixed(2)}</div>
              {service.duration && (
                <div className="text-sm text-muted-foreground">{service.duration}</div>
              )}
            </div>
          </div>
        </CardContent>

        {(showActions || isOwner) && (
          <CardFooter className="border-t pt-4">
            <div className="flex w-full items-center justify-between">
              {isOwner && service.paidUntil && (
                <div className="text-sm text-muted-foreground">
                  {daysUntilExpiration > 0
                    ? `Expires in ${daysUntilExpiration} days`
                    : 'Listing expired'}
                </div>
              )}
              <div className="flex space-x-2">
                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/services/edit/${service.id}`)}
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => setIsPaymentModalOpen(true)}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Extend Listing
                    </Button>
                  </>
                )}
                {!isOwner && showActions && (
                  <Button
                    onClick={() => router.push(`/services/${service.id}`)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      <ServicePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handleExtendListing}
        mode="extend"
        serviceId={service.id}
      />
    </>
  );
}