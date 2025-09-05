'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bed, Bath, Square, Heart, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { formatCurrency } from '@/lib/utils';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    type: string;
    status: string;
    location: {
      address: string;
      city: string;
      country: string;
    };
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        className="group relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
        whileHover={{ y: -5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Property Image */}
        <Link href={`/properties/${property.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Status Badge */}
            <Badge
              className="absolute top-2 left-2"
              variant={property.status === 'FOR_SALE' ? 'default' : 'secondary'}
            >
              {property.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
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

        {/* Property Details */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold leading-none tracking-tight">
                {property.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {property.location.city}, {property.location.country}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">
                {formatCurrency(property.price, property.currency)}
              </div>
              <p className="text-sm text-muted-foreground">
                {property.status === 'FOR_RENT' ? '/month' : ''}
              </p>
            </div>
          </div>

          {/* Property Features */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms} beds
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms} baths
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              {property.squareMeters}m²
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Tracking */}
      {isHovered && (
        <AnalyticsTracker
          listingId={property.id}
          listingType="PROPERTY"
          searchQuery={undefined}
          searchFilters={undefined}
        />
      )}
    </>
  );
}