"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/types/property';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeartIcon, MapPinIcon, BedDoubleIcon, BathIcon, RulerIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: string) => void;
  isFavorited?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  onFavorite,
  isFavorited,
  className,
}: PropertyCardProps) {
  const {
    id,
    title,
    price,
    currency,
    address,
    images,
    bedrooms,
    bathrooms,
    size,
    type,
    listingType,
    isVerified,
    _count,
  } = property;

  const mainImage = images[0]?.url || '/images/property-placeholder.jpg';
  const formattedPrice = formatCurrency(price, currency);
  const location = `${address.city}, ${address.country}`;

  return (
    <Card className={cn('group overflow-hidden', className)}>
      <div className="relative aspect-[4/3]">
        <Link href={`/properties/${id}`}>
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-white/80 hover:bg-white"
            onClick={() => onFavorite(id)}
          >
            <HeartIcon
              className={cn(
                'h-5 w-5',
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'
              )}
            />
          </Button>
        )}
        <div className="absolute bottom-2 left-2 flex gap-2">
          <Badge variant={listingType === 'RENT' ? 'secondary' : 'default'}>
            {listingType === 'RENT' ? 'For Rent' : 'For Sale'}
          </Badge>
          <Badge variant="outline" className="bg-white/80">
            {type}
          </Badge>
          {isVerified && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              Verified
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <Link href={`/properties/${id}`}>
          <h3 className="line-clamp-1 text-lg font-semibold hover:text-primary">
            {title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPinIcon className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            {bedrooms && (
              <div className="flex items-center gap-1">
                <BedDoubleIcon className="h-4 w-4" />
                <span>{bedrooms} bed</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1">
                <BathIcon className="h-4 w-4" />
                <span>{bathrooms} bath</span>
              </div>
            )}
            {size && (
              <div className="flex items-center gap-1">
                <RulerIcon className="h-4 w-4" />
                <span>{size} m²</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formattedPrice}</p>
            {listingType === 'RENT' && (
              <p className="text-sm text-muted-foreground">per month</p>
            )}
          </div>
          {_count && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {_count.favorites > 0 && (
                <div className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4 fill-current" />
                  <span>{_count.favorites}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}