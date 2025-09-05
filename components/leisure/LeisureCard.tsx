'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, Users, Clock, Share2, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { formatCurrency } from '@/lib/utils';

interface LeisureCardProps {
  leisure: {
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    price: {
      amount: number;
      currency: string;
      unit: string;
    };
    rating: number;
    reviewCount: number;
    capacity: number;
    duration: string;
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
    provider: {
      id: string;
      name: string;
      avatar: string;
      verified: boolean;
    };
  };
}

export function LeisureCard({ leisure }: LeisureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        className="group relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
        whileHover={{ y: -5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Leisure Image */}
        <Link href={`/leisure/${leisure.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={leisure.images[0]}
              alt={leisure.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Category Badge */}
            <Badge className="absolute top-2 left-2">
              {leisure.category}
            </Badge>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>

        {/* Leisure Details */}
        <div className="p-4">
          {/* Provider Info */}
          <div className="flex items-center space-x-2 mb-2">
            <Image
              src={leisure.provider.avatar}
              alt={leisure.provider.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <span className="font-medium">{leisure.provider.name}</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {leisure.rating} ({leisure.reviewCount} reviews)
              </div>
            </div>
          </div>

          {/* Title and Price */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold leading-none tracking-tight">
                {leisure.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {leisure.location.city}, {leisure.location.country}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold">
                {formatCurrency(leisure.price.amount, leisure.price.currency)}
              </div>
              <p className="text-sm text-muted-foreground">
                per {leisure.price.unit}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Up to {leisure.capacity}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {leisure.duration}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {leisure.location.city}
            </div>
          </div>

          {/* Availability */}
          <div className="mt-4">
            {leisure.availability.status === 'AVAILABLE' ? (
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Next Available: {leisure.availability.nextAvailable}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Analytics Tracking */}
      {isHovered && (
        <AnalyticsTracker
          listingId={leisure.id}
          listingType="LEISURE"
          searchQuery={undefined}
          searchFilters={undefined}
        />
      )}
    </>
  );
}