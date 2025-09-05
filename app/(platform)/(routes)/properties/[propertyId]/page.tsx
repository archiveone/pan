'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Heart,
  Share2,
  MessageSquare,
  Phone,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { formatCurrency } from '@/lib/utils';

interface PropertyPageProps {
  params: {
    propertyId: string;
  };
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { data: session } = useSession();
  const [property, setProperty] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewStartTime, setViewStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Fetch property details
    const fetchProperty = async () => {
      try {
        const response = await fetch(\`/api/properties/\${params.propertyId}\`);
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      }
    };

    fetchProperty();

    // Cleanup function to track view duration
    return () => {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000); // Duration in seconds
      // Only track if viewed for more than 5 seconds
      if (duration > 5) {
        analyticsService.trackListingView({
          listingId: params.propertyId,
          listingType: 'PROPERTY',
          userId: session?.user?.id,
          sessionId: localStorage.getItem('analytics_session_id') || '',
          duration,
          deviceType: getDeviceType(),
        });
      }
    };
  }, [params.propertyId, session, viewStartTime]);

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Analytics Tracker */}
      <AnalyticsTracker
        listingId={params.propertyId}
        listingType="PROPERTY"
      />

      {/* Property Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 mr-2" />
            {property.location.address}, {property.location.city}, {property.location.country}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {formatCurrency(property.price, property.currency)}
          </div>
          <p className="text-muted-foreground">
            {property.status === 'FOR_RENT' ? '/month' : ''}
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-12 gap-4 mb-8">
        <div className="col-span-12 md:col-span-8 relative rounded-lg overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={property.images[selectedImage]}
              alt={property.title}
              width={1200}
              height={675}
              className="w-full object-cover rounded-lg"
              priority
            />
          </motion.div>
        </div>
        <div className="col-span-12 md:col-span-4">
          <ScrollArea className="h-[675px]">
            <div className="grid grid-cols-2 gap-2">
              {property.images.map((image: string, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className={`relative rounded-lg overflow-hidden cursor-pointer ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`${property.title} - Image ${index + 1}`}
                    width={300}
                    height={200}
                    className="w-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <Button className="flex-1">
          <MessageSquare className="mr-2 h-4 w-4" />
          Contact Agent
        </Button>
        <Button className="flex-1" variant="outline">
          <Phone className="mr-2 h-4 w-4" />
          Schedule Viewing
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Square className="h-5 w-5 text-muted-foreground" />
                  <span>{property.squareMeters}m²</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {property.description}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity: string) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Badge variant="secondary">{amenity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div>
          <div className="sticky top-4 border rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Image
                src={property.agent.avatar}
                alt={property.agent.name}
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h3 className="font-semibold">{property.agent.name}</h3>
                <p className="text-sm text-muted-foreground">{property.agent.agency}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}