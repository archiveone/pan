'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Clock,
  Share2,
  Heart,
  MessageSquare,
  CheckCircle,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { formatCurrency } from '@/lib/utils';

interface LeisurePageProps {
  params: {
    leisureId: string;
  };
}

export default function LeisurePage({ params }: LeisurePageProps) {
  const { data: session } = useSession();
  const [leisure, setLeisure] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewStartTime, setViewStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Fetch leisure details
    const fetchLeisure = async () => {
      try {
        const response = await fetch(\`/api/leisure/\${params.leisureId}\`);
        const data = await response.json();
        setLeisure(data);
      } catch (error) {
        console.error('Error fetching leisure:', error);
      }
    };

    fetchLeisure();

    // Cleanup function to track view duration
    return () => {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000); // Duration in seconds
      // Only track if viewed for more than 5 seconds
      if (duration > 5) {
        analyticsService.trackListingView({
          listingId: params.leisureId,
          listingType: 'LEISURE',
          userId: session?.user?.id,
          sessionId: localStorage.getItem('analytics_session_id') || '',
          duration,
          deviceType: getDeviceType(),
        });
      }
    };
  }, [params.leisureId, session, viewStartTime]);

  if (!leisure) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Analytics Tracker */}
      <AnalyticsTracker
        listingId={params.leisureId}
        listingType="LEISURE"
      />

      {/* Leisure Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">{leisure.title}</h1>
            <Badge>{leisure.category}</Badge>
          </div>
          <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 mr-2" />
            {leisure.location.address}, {leisure.location.city}, {leisure.location.country}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {formatCurrency(leisure.price.amount, leisure.price.currency)}
          </div>
          <p className="text-muted-foreground">
            per {leisure.price.unit}
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
              src={leisure.images[selectedImage]}
              alt={leisure.title}
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
              {leisure.images.map((image: string, index: number) => (
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
                    alt={`${leisure.title} - Image ${index + 1}`}
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

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">Capacity</div>
            <div className="text-sm text-muted-foreground">Up to {leisure.capacity} people</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">Duration</div>
            <div className="text-sm text-muted-foreground">{leisure.duration}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <Star className="h-5 w-5 text-yellow-400" />
          <div>
            <div className="font-medium">Rating</div>
            <div className="text-sm text-muted-foreground">
              {leisure.rating} ({leisure.reviewCount} reviews)
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">Availability</div>
            <div className="text-sm text-muted-foreground">
              {leisure.availability.status === 'AVAILABLE' ? 'Book Now' : leisure.availability.nextAvailable}
            </div>
          </div>
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
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About this Experience</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {leisure.description}
              </p>
            </div>

            <Separator />

            {/* What's Included */}
            <div>
              <h2 className="text-xl font-semibold mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leisure.included.map((item: string) => (
                  <div key={item} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Important Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Important Information</h2>
              <div className="space-y-2">
                {leisure.importantInfo.map((info: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <span>{info}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <ScrollArea className="h-[400px]">
                {leisure.reviews.map((review: any) => (
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
            <h3 className="font-semibold text-lg mb-4">Book this Experience</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Price</span>
                <span className="font-bold">
                  {formatCurrency(leisure.price.amount, leisure.price.currency)}
                  /{leisure.price.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Duration</span>
                <span>{leisure.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Group Size</span>
                <span>Up to {leisure.capacity} people</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Availability</span>
                <Badge variant={leisure.availability.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                  {leisure.availability.status}
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