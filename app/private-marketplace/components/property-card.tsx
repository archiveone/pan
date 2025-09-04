'use client';

import { Listing } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ExtendedListing extends Listing {
  _count: {
    enquiries: number;
  };
  owner?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PropertyCardProps {
  listing: ExtendedListing;
  onSelect?: () => void;
  onInquire?: () => void;
}

export default function PropertyCard({
  listing,
  onSelect,
  onInquire,
}: PropertyCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatAddress = () => {
    const parts = [listing.city];
    if (listing.state) parts.push(listing.state);
    if (listing.country) parts.push(listing.country);
    return parts.join(', ');
  };

  return (
    <Card className="overflow-hidden">
      {/* Image Carousel */}
      <Carousel className="w-full">
        <CarouselContent>
          {listing.images.length > 0 ? (
            listing.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video">
                  <img
                    src={image}
                    alt={`${listing.title} - Image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        {listing.images.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-2">
            {listing.title}
          </h3>
          <Badge variant="secondary">
            {listing.propertyType?.toLowerCase()}
          </Badge>
        </div>

        <p className="text-2xl font-bold mb-2">
          {formatPrice(Number(listing.price))}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span>{listing.bedrooms} beds</span>
          <span>•</span>
          <span>{listing.bathrooms} baths</span>
          <span>•</span>
          <span>{listing.area} m²</span>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {formatAddress()}
        </p>

        {/* Features */}
        {listing.features && listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.features.map((feature, index) => (
              <Badge key={index} variant="outline">
                {feature}
              </Badge>
            ))}
          </div>
        )}

        {/* Owner Info */}
        {listing.owner && (
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={listing.owner.image || undefined} />
              <AvatarFallback>
                {listing.owner.name?.charAt(0) || 'O'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              Listed by {listing.owner.name}
            </span>
          </div>
        )}

        {/* Inquiry Count */}
        <div className="text-sm text-gray-500 mb-4">
          {listing._count.enquiries} agent{listing._count.enquiries !== 1 && 's'} interested
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onSelect && (
            <Button
              onClick={onSelect}
              variant="secondary"
              className="flex-1"
            >
              View Inquiries ({listing._count.enquiries})
            </Button>
          )}
          {onInquire && (
            <Button
              onClick={onInquire}
              className="flex-1"
            >
              Submit Inquiry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}