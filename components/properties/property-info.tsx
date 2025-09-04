'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Eye,
  Euro,
  Building2,
  Tag,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { formatPrice, formatNumber, formatDate } from '@/lib/utils';

interface PropertyInfoProps {
  property: any; // Replace with proper type
  isFavorited: boolean;
  currentUser: any; // Replace with proper type
}

export function PropertyInfo({ 
  property, 
  isFavorited, 
  currentUser 
}: PropertyInfoProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);

  const handleFavorite = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: favorited ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: property.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      setFavorited(!favorited);
      toast({
        title: favorited ? 'Removed from favorites' : 'Added to favorites',
        description: favorited 
          ? 'This property has been removed from your favorites'
          : 'This property has been added to your favorites',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Property link has been copied to your clipboard',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {property.title}
          </h1>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{property.propertyListing.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                  onClick={handleFavorite}
                  className={favorited ? 'text-red-500' : ''}
                >
                  <Heart className={favorited ? 'fill-current' : ''} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {favorited ? 'Remove from favorites' : 'Add to favorites'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Share property
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Price and Status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-bold text-primary mb-1">
            <Euro className="w-6 h-6 inline-block mr-1" />
            {formatPrice(property.propertyListing.price, false)}
          </div>
          {property.propertyListing.pricePerSqm && (
            <div className="text-sm text-muted-foreground">
              €{formatNumber(property.propertyListing.pricePerSqm)}/m²
            </div>
          )}
        </div>
        <Badge 
          className={property.propertyListing.status === 'FOR_SALE' ? 'bg-green-600' : 'bg-blue-600'}
        >
          {property.propertyListing.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
        </Badge>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <Bed className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="font-semibold">{property.propertyListing.bedrooms}</div>
            <div className="text-sm text-muted-foreground">Bedrooms</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Bath className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="font-semibold">{property.propertyListing.bathrooms}</div>
            <div className="text-sm text-muted-foreground">Bathrooms</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Square className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="font-semibold">{formatNumber(property.propertyListing.size)}m²</div>
            <div className="text-sm text-muted-foreground">Living Area</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="font-semibold">{property.propertyListing.propertyType}</div>
            <div className="text-sm text-muted-foreground">Property Type</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-muted-foreground whitespace-pre-line">
          {property.description}
        </p>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Listed on {formatDate(property.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{formatNumber(property._count.views)} views</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="w-4 h-4" />
          <span>Property ID: {property.id}</span>
        </div>
        {property.propertyListing.availability && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Available: {property.propertyListing.availability}</span>
          </div>
        )}
      </div>
    </div>
  );
}