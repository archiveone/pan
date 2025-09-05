'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Briefcase, Shield, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { formatCurrency } from '@/lib/utils';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    provider: {
      id: string;
      name: string;
      avatar: string;
      rating: number;
      reviewCount: number;
      verified: boolean;
      experience: number;
    };
    category: string;
    price: {
      amount: number;
      currency: string;
      unit: string;
    };
    location: {
      address: string;
      city: string;
      country: string;
    };
    availability: {
      status: string;
      nextAvailable?: string;
    };
    images: string[];
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        className="group relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
        whileHover={{ y: -5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Service Image */}
        <Link href={`/services/${service.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={service.images[0]}
              alt={service.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Category Badge */}
            <Badge className="absolute top-2 left-2">
              {service.category}
            </Badge>

            {/* Availability Badge */}
            <Badge
              variant={service.availability.status === 'AVAILABLE' ? 'default' : 'secondary'}
              className="absolute top-2 right-2"
            >
              {service.availability.status === 'AVAILABLE' ? 'Available Now' : 'Next Available: ' + service.availability.nextAvailable}
            </Badge>
          </div>
        </Link>

        {/* Service Details */}
        <div className="p-4">
          {/* Provider Info */}
          <div className="flex items-center space-x-2 mb-2">
            <Image
              src={service.provider.avatar}
              alt={service.provider.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center">
                <span className="font-medium">{service.provider.name}</span>
                {service.provider.verified && (
                  <Shield className="h-4 w-4 text-primary ml-1" />
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {service.provider.rating} ({service.provider.reviewCount} reviews)
              </div>
            </div>
          </div>

          {/* Service Title and Price */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold leading-none tracking-tight">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {service.location.city}, {service.location.country}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold">
                {formatCurrency(service.price.amount, service.price.currency)}
              </div>
              <p className="text-sm text-muted-foreground">
                per {service.price.unit}
              </p>
            </div>
          </div>

          {/* Service Features */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              {service.provider.experience}+ years
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {service.location.city}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {service.availability.status}
            </div>
          </div>

          {/* Action Button */}
          <Button className="w-full mt-4" variant="default">
            Book Now
          </Button>
        </div>
      </motion.div>

      {/* Analytics Tracking */}
      {isHovered && (
        <AnalyticsTracker
          listingId={service.id}
          listingType="SERVICE"
          searchQuery={undefined}
          searchFilters={undefined}
        />
      )}
    </>
  );
}