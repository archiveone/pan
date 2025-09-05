'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  BedDouble,
  Bath,
  Square,
  Calendar,
  Phone,
  Mail,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Sample property data
const property = {
  id: 1,
  title: 'Modern Apartment in City Center',
  description: `Beautiful modern apartment with stunning city views and high-end finishes. This exceptional property features:

  • Open-plan living and dining area
  • Fully equipped modern kitchen
  • Master bedroom with ensuite
  • Second bedroom with built-in wardrobes
  • Spacious balcony with city views
  • Secure underground parking
  • 24/7 concierge service
  • Residents' gym and lounge`,
  location: 'Dublin 2',
  address: '123 Main Street, Dublin 2, D02 AB12',
  price: 2500,
  type: 'Apartment',
  status: 'For Rent',
  beds: 2,
  baths: 2,
  sqm: 85,
  features: [
    'Parking',
    'Balcony',
    'Gym',
    'Elevator',
    'Security',
    'Storage',
    'Pet Friendly',
    'Furnished',
  ],
  amenities: [
    'Air Conditioning',
    'Central Heating',
    'Dishwasher',
    'Washing Machine',
    'High-Speed Internet',
    'Smart Home System',
  ],
  images: [
    '/images/properties/apartment-1.jpg',
    '/images/properties/apartment-2.jpg',
    '/images/properties/apartment-3.jpg',
    '/images/properties/apartment-4.jpg',
  ],
  agent: {
    name: 'Sarah Johnson',
    image: '/images/agents/agent-1.jpg',
    phone: '+353 1 234 5678',
    email: 'sarah.johnson@greia.com',
    experience: '8 years',
    listings: 45,
  },
  video: '/videos/property-tour.mp4',
  virtualTour: 'https://my.matterport.com/show/?m=example',
  floorPlan: '/images/properties/floor-plan.jpg',
  nearbyPlaces: [
    { name: 'City Center Shopping', distance: '0.2 km' },
    { name: 'Central Park', distance: '0.5 km' },
    { name: 'Metro Station', distance: '0.3 km' },
    { name: 'International School', distance: '1.2 km' },
  ],
};

export default function PropertyDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showGallery, setShowGallery] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={property.images[currentImageIndex]}
            alt={property.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-black/20"
            onClick={prevImage}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-black/20"
            onClick={nextImage}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {property.images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>

        <Button
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70"
          onClick={() => setShowGallery(true)}
        >
          View All Photos
        </Button>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <Card className="p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{property.status}</Badge>
                <Badge variant="outline">{property.type}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {property.address}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-primary">
                €{property.price}
                <span className="text-base font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="w-4 h-4" />
                </Button>
                <Button>Schedule Viewing</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{property.beds}</div>
                <div className="text-sm text-muted-foreground">Bedrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{property.baths}</div>
                <div className="text-sm text-muted-foreground">Bathrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{property.sqm}</div>
                <div className="text-sm text-muted-foreground">Square Meters</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Property Details */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {property.description}
              </p>
            </Card>

            {/* Features & Amenities */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Location & Nearby */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
                {/* Add map component here */}
                <div className="absolute inset-0 bg-muted" />
              </div>
              <h3 className="text-lg font-medium mb-3">Nearby Places</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.nearbyPlaces.map((place) => (
                  <div key={place.name} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{place.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({place.distance})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Agent Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={property.agent.image}
                  alt={property.agent.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{property.agent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.agent.experience} experience
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  {property.agent.phone}
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Agent
                </Button>
              </div>
            </Card>

            {/* Schedule Viewing */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule a Viewing</h3>
              <div className="space-y-4">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Add time slots */}
                  </SelectContent>
                </Select>
                <Button className="w-full">Request Viewing</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Gallery Dialog */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Property Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowGallery(false);
                }}
              >
                <Image
                  src={image}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}