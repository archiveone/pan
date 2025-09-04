'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MapPin, Calendar, Clock, Users, Tag, Star } from 'lucide-react';
import axios from 'axios';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface ListingCardProps {
  data: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    postcode: string;
    category: 'PROPERTY' | 'SERVICE' | 'LEISURE';
    images: string[];
    visibility: 'PUBLIC' | 'PRIVATE';
    availability: string;
    tags: string[];
    createdAt: string;
    user: {
      id: string;
      name: string;
      image: string;
      rating: number;
    };
    propertyListing?: {
      propertyType: string;
      bedrooms: number;
      bathrooms: number;
      size: number;
      listingType: 'SALE' | 'RENT' | 'AUCTION';
    };
    serviceListing?: {
      serviceType: string;
      expertise: string[];
      pricing: {
        type: 'HOURLY' | 'FIXED' | 'QUOTE';
        rate?: number;
      };
    };
    leisureListing?: {
      leisureType: 'RENTAL' | 'EXPERIENCE' | 'VENUE';
      capacity?: number;
      duration: number;
    };
    _count: {
      favorites: number;
      views: number;
      bookings: number;
    };
  };
  currentUser?: {
    id: string;
    favorites: string[];
  };
}

export const ListingCard = ({
  data,
  currentUser,
}: ListingCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(
    currentUser?.favorites.includes(data.id) || false
  );
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = () => {
    router.push(`/listings/${data.id}`);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/favorites', { listingId: data.id });
      setIsFavorited(!isFavorited);
      
      toast({
        title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update favorites. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = () => {
    switch (data.category) {
      case 'PROPERTY':
        if (data.propertyListing?.listingType === 'RENT') {
          return `£${data.price.toLocaleString()} pcm`;
        }
        return `£${data.price.toLocaleString()}`;
      
      case 'SERVICE':
        if (data.serviceListing?.pricing.type === 'HOURLY') {
          return `£${data.price.toLocaleString()}/hr`;
        } else if (data.serviceListing?.pricing.type === 'QUOTE') {
          return 'Quote on request';
        }
        return `£${data.price.toLocaleString()}`;
      
      case 'LEISURE':
        if (data.leisureListing?.leisureType === 'RENTAL') {
          return `£${data.price.toLocaleString()}/day`;
        }
        return `£${data.price.toLocaleString()}`;
    }
  };

  const renderCategorySpecificInfo = () => {
    switch (data.category) {
      case 'PROPERTY':
        return (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex items-center text-sm">
              <Tag className="h-4 w-4 mr-1" />
              {data.propertyListing?.propertyType}
            </div>
            {data.propertyListing?.bedrooms && (
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1" />
                {data.propertyListing.bedrooms} beds
              </div>
            )}
            {data.propertyListing?.size && (
              <div className="flex items-center text-sm">
                <span className="mr-1">📏</span>
                {data.propertyListing.size} m²
              </div>
            )}
          </div>
        );

      case 'SERVICE':
        return (
          <div className="space-y-2 mt-2">
            <div className="flex items-center text-sm">
              <Tag className="h-4 w-4 mr-1" />
              {data.serviceListing?.serviceType}
            </div>
            {data.serviceListing?.expertise && (
              <div className="flex flex-wrap gap-1">
                {data.serviceListing.expertise.map((exp) => (
                  <Badge key={exp} variant="secondary" className="text-xs">
                    {exp}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'LEISURE':
        return (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center text-sm">
              <Tag className="h-4 w-4 mr-1" />
              {data.leisureListing?.leisureType}
            </div>
            {data.leisureListing?.duration && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {data.leisureListing.duration} hrs
              </div>
            )}
            {data.leisureListing?.capacity && (
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1" />
                Up to {data.leisureListing.capacity}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden cursor-pointer transition hover:shadow-lg"
    >
      <div className="relative aspect-square">
        <Image
          fill
          src={data.images[0]}
          alt={data.title}
          className="object-cover"
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 bg-white/80"
          onClick={handleFavorite}
          disabled={isLoading}
        >
          <Heart
            className={cn(
              "h-5 w-5",
              isFavorited && "fill-red-500 stroke-red-500"
            )}
          />
        </Button>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{data.title}</CardTitle>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
            <span className="text-sm">{data.user.rating.toFixed(1)}</span>
          </div>
        </div>
        <CardDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {data.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">{formatPrice()}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {data.description}
        </p>
        {renderCategorySpecificInfo()}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={data.user.image} />
            <AvatarFallback>{data.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{data.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>{data._count.views} views</span>
          <span>•</span>
          <span>{data._count.bookings} bookings</span>
        </div>
      </CardFooter>
    </Card>
  );
};