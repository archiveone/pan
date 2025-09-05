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
  CheckCircle,
  Award,
  Briefcase,
  MessageSquare,
  Shield,
  Users,
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

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    category: string;
    subcategory?: string;
    status: 'available' | 'busy' | 'unavailable';
    pricing: {
      type: 'fixed' | 'hourly' | 'project' | 'quote';
      amount?: number;
      currency: string;
      unit?: string;
    };
    location: {
      address?: string;
      city: string;
      postcode: string;
      serviceArea?: string[];
      remote?: boolean;
    };
    provider: {
      id: string;
      name: string;
      image?: string;
      verified: boolean;
      company?: {
        name: string;
        logo?: string;
      };
      stats: {
        completedJobs: number;
        yearsExperience: number;
        responseRate: number;
        responseTime: string;
      };
    };
    rating: {
      average: number;
      count: number;
      breakdown: {
        quality: number;
        reliability: number;
        value: number;
      };
    };
    images: {
      url: string;
      alt: string;
    }[];
    availability: {
      nextSlot?: string;
      slots?: {
        date: string;
        times: string[];
      }[];
      instantBooking?: boolean;
    };
    certifications?: {
      name: string;
      issuer: string;
      year: number;
    }[];
    insurance?: {
      type: string;
      coverage: string;
    };
    featured?: boolean;
    promoted?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  variant?: 'default' | 'compact' | 'featured' | 'grid';
  className?: string;
}

export function ServiceCard({
  service,
  variant = 'default',
  className,
}: ServiceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const formatPrice = (pricing: typeof service.pricing) => {
    if (!pricing.amount) return 'Quote on request';
    
    const amount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: pricing.currency,
      maximumFractionDigits: 0,
    }).format(pricing.amount);

    switch (pricing.type) {
      case 'hourly':
        return \`\${amount}/hour\`;
      case 'project':
        return \`From \${amount}\`;
      case 'fixed':
        return amount;
      default:
        return 'Quote on request';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) =>
        prev === 0 ? service.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === service.images.length - 1 ? 0 : prev + 1
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
        {service.featured && (
          <Badge
            className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground"
            variant="default"
          >
            Featured
          </Badge>
        )}
        {service.promoted && (
          <Badge
            className="absolute top-2 right-2 z-10"
            variant="secondary"
          >
            Promoted
          </Badge>
        )}
        <div className="relative w-full h-full">
          <Image
            src={service.images[currentImageIndex].url}
            alt={service.images[currentImageIndex].alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={variant === 'featured'}
          />
          {service.images.length > 1 && (
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
                {service.images.map((_, index) => (
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
            <CardTitle className="line-clamp-1">{service.title}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {service.location.city}
              {service.location.serviceArea && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="ml-1 text-primary">
                      (Service Area)
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Serves: {service.location.serviceArea.join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {service.location.remote && (
                <Badge variant="outline" className="ml-2">
                  Remote Available
                </Badge>
              )}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(service.status)}>
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold">
            {formatPrice(service.pricing)}
          </span>
          {service.pricing.unit && (
            <span className="text-muted-foreground">
              per {service.pricing.unit}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Provider Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <Briefcase className="h-5 w-5 mx-auto text-muted-foreground" />
              <span className="text-sm font-medium">
                {service.provider.stats.completedJobs}+ Jobs
              </span>
            </div>
            <div className="space-y-1">
              <Award className="h-5 w-5 mx-auto text-muted-foreground" />
              <span className="text-sm font-medium">
                {service.provider.stats.yearsExperience}+ Years
              </span>
            </div>
            <div className="space-y-1">
              <MessageSquare className="h-5 w-5 mx-auto text-muted-foreground" />
              <span className="text-sm font-medium">
                {service.provider.stats.responseRate}% Response
              </span>
            </div>
            <div className="space-y-1">
              <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
              <span className="text-sm font-medium">
                {service.provider.stats.responseTime}
              </span>
            </div>
          </div>

          {/* Rating Breakdown */}
          {variant !== 'compact' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Quality</span>
                <div className="flex items-center">
                  <Progress
                    value={service.rating.breakdown.quality * 20}
                    className="w-24 h-2 mr-2"
                  />
                  <span className="text-sm font-medium">
                    {service.rating.breakdown.quality.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reliability</span>
                <div className="flex items-center">
                  <Progress
                    value={service.rating.breakdown.reliability * 20}
                    className="w-24 h-2 mr-2"
                  />
                  <span className="text-sm font-medium">
                    {service.rating.breakdown.reliability.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Value</span>
                <div className="flex items-center">
                  <Progress
                    value={service.rating.breakdown.value * 20}
                    className="w-24 h-2 mr-2"
                  />
                  <span className="text-sm font-medium">
                    {service.rating.breakdown.value.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Availability */}
          {service.availability.nextSlot && (
            <div className="flex items-center p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Next Available</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(service.availability.nextSlot).toLocaleDateString(
                    'en-GB',
                    {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    }
                  )}
                </p>
              </div>
              {service.availability.instantBooking && (
                <Badge variant="secondary" className="ml-auto">
                  Instant Booking
                </Badge>
              )}
            </div>
          )}

          {/* Certifications & Insurance */}
          {(service.certifications || service.insurance) && variant !== 'compact' && (
            <div className="flex flex-wrap gap-2">
              {service.certifications?.map((cert) => (
                <TooltipProvider key={cert.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {cert.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {cert.name} by {cert.issuer} ({cert.year})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {service.insurance && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Insured
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {service.insurance.type}: {service.insurance.coverage}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={service.provider.image} />
            <AvatarFallback>{service.provider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <p className="text-sm font-medium">{service.provider.name}</p>
              {service.provider.verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CheckCircle className="h-4 w-4 ml-1 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Provider</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {service.provider.company && (
              <p className="text-xs text-muted-foreground">
                {service.provider.company.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm font-medium">
            {service.rating.average.toFixed(1)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            ({service.rating.count})
          </span>
        </div>
      </CardFooter>

      {/* Share Dialog */}
      {isShareOpen && (
        <ShareButtons
          title={service.title}
          description={\`\${service.category} service in \${service.location.city}\`}
          url={\`https://greia.com/services/\${service.id}\`}
          image={service.images[0].url}
          type="service"
        />
      )}
    </Card>
  );
}