'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  Briefcase,
  Shield,
  Share2,
  MessageSquare,
  Phone,
  Calendar,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { formatCurrency } from '@/lib/utils';

interface ServicePageProps {
  params: {
    serviceId: string;
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  const { data: session } = useSession();
  const [service, setService] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewStartTime, setViewStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Fetch service details
    const fetchService = async () => {
      try {
        const response = await fetch(\`/api/services/\${params.serviceId}\`);
        const data = await response.json();
        setService(data);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };

    fetchService();

    // Cleanup function to track view duration
    return () => {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000); // Duration in seconds
      // Only track if viewed for more than 5 seconds
      if (duration > 5) {
        analyticsService.trackListingView({
          listingId: params.serviceId,
          listingType: 'SERVICE',
          userId: session?.user?.id,
          sessionId: localStorage.getItem('analytics_session_id') || '',
          duration,
          deviceType: getDeviceType(),
        });
      }
    };
  }, [params.serviceId, session, viewStartTime]);

  if (!service) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Analytics Tracker */}
      <AnalyticsTracker
        listingId={params.serviceId}
        listingType="SERVICE"
      />

      {/* Service Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{service.title}</h1>
          <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 mr-2" />
            {service.location.address}, {service.location.city}, {service.location.country}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {formatCurrency(service.price.amount, service.price.currency)}
          </div>
          <p className="text-muted-foreground">
            per {service.price.unit}
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
              src={service.images[selectedImage]}
              alt={service.title}
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
              {service.images.map((image: string, index: number) => (
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
                    alt={`${service.title} - Image ${index + 1}`}
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
          <Calendar className="mr-2 h-4 w-4" />
          Book Now
        </Button>
        <Button className="flex-1" variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Contact Provider
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* Provider Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About the Provider</h2>
              <div className="flex items-center space-x-4">
                <Image
                  src={service.provider.avatar}
                  alt={service.provider.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg">{service.provider.name}</h3>
                    {service.provider.verified && (
                      <Shield className="h-5 w-5 text-primary ml-2" />
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {service.provider.rating} ({service.provider.reviewCount} reviews)
                  </div>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {service.provider.experience} years experience
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {service.description}
              </p>
            </div>

            <Separator />

            {/* Service Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature: string) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <ScrollArea className="h-[400px]">
                {service.reviews.map((review: any) => (
                  <div key={review.id} className="mb-4 pb-4 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={review.user.avatar}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium">{review.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div>
          <div className="sticky top-4 border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Book this Service</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Price</span>
                <span className="font-bold">
                  {formatCurrency(service.price.amount, service.price.currency)}
                  /{service.price.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Availability</span>
                <Badge variant={service.availability.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                  {service.availability.status}
                </Badge>
              </div>
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Check Available Dates
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Provider
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}