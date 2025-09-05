'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  Star,
  MapPin,
  Clock,
  Calendar,
  Users,
  Tag,
  Ticket,
  Info,
  Shield,
  CalendarClock,
  CircleDollarSign,
  Sparkles,
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
import { Progress } from '@/components/ui/progress';

interface LeisureCardProps {
  leisure: {
    id: string;
    title: string;
    type: 'event' | 'rental' | 'experience';
    category: string;
    subcategory?: string;
    status: 'available' | 'limited' | 'sold-out' | 'upcoming';
    pricing: {
      type: 'fixed' | 'from' | 'range';
      amount: number;
      maxAmount?: number;
      currency: string;
      unit?: 'per-person' | 'per-hour' | 'per-day' | 'total';
      discounts?: {
        type: string;
        amount: number;
        description: string;
      }[];
    };
    location: {
      venue?: string;
      address: string;
      city: string;
      postcode: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    provider: {
      id: string;
      name: string;
      image?: string;
      verified: boolean;
      organization?: {
        name: string;
        logo?: string;
      };
      rating: {
        average: number;
        count: number;
      };
    };
    schedule: {
      type: 'one-time' | 'recurring' | 'flexible';
      startDate?: string;
      endDate?: string;
      times?: string[];
      duration?: string;
      availability?: {
        total: number;
        remaining: number;
      };
    };
    features: {
      maxParticipants?: number;
      minParticipants?: number;
      amenities?: string[];
      included?: string[];
      requirements?: string[];
      accessibility?: string[];
    };
    images: {
      url: string;
      alt: string;
    }[];
    rating: {
      average: number;
      count: number;
      breakdown: {
        experience: number;
        value: number;
        organization: number;
      };
    };
    insurance?: {
      included: boolean;
      coverage?: string;
    };
    cancellation?: {
      policy: string;
      deadline: string;
      refund: string;
    };
    featured?: boolean;
    promoted?: boolean;
    trending?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  variant?: 'default' | 'compact' | 'featured' | 'grid';
  className?: string;
}

export function LeisureCard({
  leisure,
  variant = 'default',
  className,
}: LeisureCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const formatPrice = (pricing: typeof leisure.pricing) => {
    const formatAmount = (amount: number) =>
      new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: pricing.currency,
        maximumFractionDigits: 0,
      }).format(amount);

    let priceText = '';
    switch (pricing.type) {
      case 'from':
        priceText = \`From \${formatAmount(pricing.amount)}\`;
        break;
      case 'range':
        priceText = \`\${formatAmount(pricing.amount)} - \${formatAmount(
          pricing.maxAmount!
        )}\`;
        break;
      default:
        priceText = formatAmount(pricing.amount);
    }

    if (pricing.unit) {
      priceText += \` \${pricing.unit.replace('-', ' ')}\`;
    }

    return priceText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-orange-100 text-orange-800';
      case 'sold-out':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(\`2000-01-01T\${time}\`).toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) =>
        prev === 0 ? leisure.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === leisure.images.length - 1 ? 0 : prev + 1
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
        {leisure.featured && (
          <Badge
            className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground"
            variant="default"
          >
            Featured
          </Badge>
        )}
        {leisure.promoted && (
          <Badge
            className="absolute top-2 right-2 z-10"
            variant="secondary"
          >
            Promoted
          </Badge>
        )}
        {leisure.trending && (
          <Badge
            className="absolute top-2 right-24 z-10 bg-rose-100 text-rose-800"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        )}
        <div className="relative w-full h-full">
          <Image
            src={leisure.images[currentImageIndex].url}
            alt={leisure.images[currentImageIndex].alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={variant === 'featured'}
          />
          {leisure.images.length > 1 && (
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
                {leisure.images.map((_, index) => (
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
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {leisure.type}
              </Badge>
              <CardTitle className="line-clamp-1">{leisure.title}</CardTitle>
            </div>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {leisure.location.venue && (
                <>
                  <span>{leisure.location.venue},</span>
                  <span className="mx-1">•</span>
                </>
              )}
              {leisure.location.city}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(leisure.status)}>
            {leisure.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">
              {formatPrice(leisure.pricing)}
            </span>
            {leisure.pricing.discounts && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-2">
                      <Tag className="h-3 w-3 mr-1" />
                      Discounts Available
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {leisure.pricing.discounts.map((discount, index) => (
                        <p key={index}>
                          {discount.type}: {discount.description}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {leisure.schedule.availability && (
            <div className="text-sm">
              <span className="text-muted-foreground">
                {leisure.schedule.availability.remaining} spots left
              </span>
              <Progress
                value={
                  (leisure.schedule.availability.remaining /
                    leisure.schedule.availability.total) *
                  100
                }
                className="w-24 h-2 mt-1"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Schedule Information */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              {leisure.schedule.type === 'one-time' ? (
                <span>
                  {formatDate(leisure.schedule.startDate!)}
                  {leisure.schedule.times && (
                    <>
                      <span className="mx-1">•</span>
                      {leisure.schedule.times.map(formatTime).join(', ')}
                    </>
                  )}
                </span>
              ) : leisure.schedule.type === 'recurring' ? (
                <span>
                  Multiple dates available
                  {leisure.schedule.duration && (
                    <>
                      <span className="mx-1">•</span>
                      {leisure.schedule.duration}
                    </>
                  )}
                </span>
              ) : (
                <span>Flexible scheduling available</span>
              )}
            </div>
          </div>

          {/* Features & Requirements */}
          {variant !== 'compact' && (
            <div className="grid grid-cols-2 gap-4">
              {leisure.features.maxParticipants && (
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  Up to {leisure.features.maxParticipants} participants
                </div>
              )}
              {leisure.features.duration && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {leisure.features.duration}
                </div>
              )}
              {leisure.insurance?.included && (
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  Insurance included
                </div>
              )}
              {leisure.cancellation && (
                <div className="flex items-center text-sm">
                  <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Free cancellation
                </div>
              )}
            </div>
          )}

          {/* Amenities & Inclusions */}
          {variant !== 'compact' &&
            (leisure.features.amenities || leisure.features.included) && (
              <div className="flex flex-wrap gap-2">
                {leisure.features.amenities?.map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
                {leisure.features.included?.map((item) => (
                  <Badge key={item} variant="outline" className="bg-primary/10">
                    {item}
                  </Badge>
                ))}
              </div>
            )}

          {/* Requirements & Accessibility */}
          {variant !== 'compact' &&
            (leisure.features.requirements || leisure.features.accessibility) && (
              <div className="flex flex-wrap gap-2">
                {leisure.features.requirements?.map((req) => (
                  <TooltipProvider key={req}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-yellow-50">
                          <Info className="h-3 w-3 mr-1" />
                          {req}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Required: {req}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {leisure.features.accessibility?.map((access) => (
                  <Badge
                    key={access}
                    variant="outline"
                    className="bg-green-50"
                  >
                    {access}
                  </Badge>
                ))}
              </div>
            )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={leisure.provider.image} />
            <AvatarFallback>{leisure.provider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <p className="text-sm font-medium">{leisure.provider.name}</p>
              {leisure.provider.verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Shield className="h-4 w-4 ml-1 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Provider</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {leisure.provider.organization && (
              <p className="text-xs text-muted-foreground">
                {leisure.provider.organization.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm font-medium">
            {leisure.rating.average.toFixed(1)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            ({leisure.rating.count})
          </span>
        </div>
      </CardFooter>

      {/* Share Dialog */}
      {isShareOpen && (
        <ShareButtons
          title={leisure.title}
          description={\`\${leisure.type} in \${leisure.location.city}\`}
          url={\`https://greia.com/leisure/\${leisure.id}\`}
          image={leisure.images[0].url}
          type="leisure"
        />
      )}
    </Card>
  );
}