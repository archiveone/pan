'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  Car,
  Maximize2,
  Star,
  Calendar,
  MapPin,
  Tag,
  TrendingUp,
  Building2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ShareButtons } from '@/components/shared/ShareButtons';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    type: string;
    status: 'for-sale' | 'for-rent' | 'sold' | 'rented' | 'under-offer';
    price: number;
    priceType: 'total' | 'monthly';
    currency: string;
    location: {
      address: string;
      city: string;
      postcode: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    features: {
      bedrooms: number;
      bathrooms: number;
      receptionRooms?: number;
      parkingSpaces?: number;
      floorArea: {
        value: number;
        unit: 'sqft' | 'sqm';
      };
    };
    images: {
      url: string;
      alt: string;
    }[];
    agent: {
      id: string;
      name: string;
      image?: string;
      agency: {
        name: string;
        logo?: string;
      };
    };
    rating?: {
      average: number;
      count: number;
    };
    featured?: boolean;
    newBuild?: boolean;
    openHouse?: {
      date: string;
      startTime: string;
      endTime: string;
    };
    priceHistory?: {
      date: string;
      price: number;
    }[];
    yearBuilt?: number;
    epcRating?: string;
    tenure?: 'freehold' | 'leasehold';
    createdAt: string;
    updatedAt: string;
  };
  variant?: 'default' | 'compact' | 'featured' | 'grid';
  className?: string;
}

export function PropertyCard({
  property,
  variant = 'default',
  className,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: property.currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatArea = (value: number, unit: 'sqft' | 'sqm') => {
    return \`\${value.toLocaleString()} \${unit}\`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'for-sale':
        return 'bg-green-100 text-green-800';
      case 'for-rent':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'rented':
        return 'bg-purple-100 text-purple-800';
      case 'under-offer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleFavorite = async () => {
    try {
      // API call to toggle favorite status
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg',
        variant === 'featured' && 'border-primary',
        variant === 'compact' && 'max-w-sm',
        variant === 'grid' && 'h-full',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {property.featured && (
          <Badge
            className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground"
            variant="default"
          >
            Featured
          </Badge>
        )}
        {property.newBuild && (
          <Badge
            className="absolute top-2 right-2 z-10"
            variant="secondary"
          >
            New Build
          </Badge>
        )}
        <div className="relative w-full h-full">
          <Image
            src={property.images[currentImageIndex].url}
            alt={property.images[currentImageIndex].alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={variant === 'featured'}
          />
          {property.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => handleImageNavigation('prev')}
              >
                ‹
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => handleImageNavigation('next')}
              >
                ›
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/75'
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 text-white hover:bg-black/70"
            onClick={handleFavorite}
          >
            <Heart
              className={cn(
                'h-5 w-5',
                isFavorited && 'fill-current text-red-500'
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 text-white hover:bg-black/70"
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{property.title}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {property.location.address}, {property.location.city}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(property.status)}>
            {property.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold">
            {formatPrice(property.price)}
          </span>
          {property.priceType === 'monthly' && (
            <span className="text-muted-foreground">per month</span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <Bed className="h-5 w-5 mx-auto text-muted-foreground" />
            <span className="text-sm font-medium">
              {property.features.bedrooms} {property.features.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          </div>
          <div className="space-y-1">
            <Bath className="h-5 w-5 mx-auto text-muted-foreground" />
            <span className="text-sm font-medium">
              {property.features.bathrooms} {property.features.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          </div>
          <div className="space-y-1">
            <Square className="h-5 w-5 mx-auto text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatArea(
                property.features.floorArea.value,
                property.features.floorArea.unit
              )}
            </span>
          </div>
          {property.features.parkingSpaces && (
            <div className="space-y-1">
              <Car className="h-5 w-5 mx-auto text-muted-foreground" />
              <span className="text-sm font-medium">
                {property.features.parkingSpaces} {property.features.parkingSpaces === 1 ? 'Space' : 'Spaces'}
              </span>
            </div>
          )}
        </div>

        {variant !== 'compact' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {property.yearBuilt && (
              <div className="flex items-center text-sm">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                Built in {property.yearBuilt}
              </div>
            )}
            {property.epcRating && (
              <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                EPC Rating {property.epcRating}
              </div>
            )}
            {property.tenure && (
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                {property.tenure.charAt(0).toUpperCase() + property.tenure.slice(1)}
              </div>
            )}
          </div>
        )}

        {property.openHouse && (
          <div className="mt-4 flex items-center p-3 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            <div>
              <p className="font-medium">Open House</p>
              <p className="text-sm text-muted-foreground">
                {new Date(property.openHouse.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}{' '}
                • {property.openHouse.startTime} - {property.openHouse.endTime}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={property.agent.image} />
            <AvatarFallback>{property.agent.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{property.agent.name}</p>
            <p className="text-xs text-muted-foreground">
              {property.agent.agency.name}
            </p>
          </div>
        </div>
        {property.rating && (
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">
              {property.rating.average.toFixed(1)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              ({property.rating.count})
            </span>
          </div>
        )}
      </CardFooter>

      {/* Share Dialog */}
      {isShareOpen && (
        <ShareButtons
          title={property.title}
          description={\`\${property.features.bedrooms} bedroom \${property.type.toLowerCase()} \${property.status.replace('-', ' ')} in \${property.location.city}\`}
          url={\`https://greia.com/properties/\${property.id}\`}
          image={property.images[0].url}
          type="property"
        />
      )}
    </Card>
  );
}