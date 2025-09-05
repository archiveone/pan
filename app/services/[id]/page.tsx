'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Shield,
  Award,
  ThumbsUp,
  MessageCircle,
  ChevronRight,
  Euro,
  Users,
  FileText,
  Briefcase,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample service provider data
const provider = {
  id: 1,
  name: "Mike's Plumbing Services",
  title: 'Professional Plumbing Services',
  description: `With over 12 years of experience, we provide comprehensive plumbing services for residential and commercial properties. Our team of certified plumbers is available 24/7 for emergency callouts.

Key Services:
• Emergency Repairs
• Installation & Upgrades
• Maintenance & Inspections
• Bathroom & Kitchen Fitting
• Leak Detection & Repair
• Heating System Services`,
  location: 'Dublin City',
  coverage: ['Dublin City', 'South Dublin', 'North Dublin'],
  rating: 4.8,
  reviews: 156,
  responseTime: '1 hour',
  completedJobs: 450,
  experience: '12 years',
  team: 5,
  verified: true,
  insurance: {
    provider: 'SafeGuard Insurance',
    coverage: '€2,000,000',
    verified: true,
  },
  certifications: [
    {
      name: 'Master Plumber License',
      issuer: 'Plumbing Federation of Ireland',
      year: 2015,
    },
    {
      name: 'Gas Safety Certified',
      issuer: 'Gas Networks Ireland',
      year: 2018,
    },
  ],
  services: [
    {
      name: 'Emergency Plumbing',
      price: '€120/hour',
      duration: '1-2 hours',
      description: 'Available 24/7 for urgent plumbing issues',
    },
    {
      name: 'Bathroom Installation',
      price: 'From €2,500',
      duration: '2-3 days',
      description: 'Complete bathroom fitting service',
    },
    {
      name: 'Boiler Service',
      price: '€95',
      duration: '1 hour',
      description: 'Annual boiler maintenance and inspection',
    },
  ],
  availability: {
    hours: '8:00 AM - 6:00 PM',
    days: 'Monday - Saturday',
    emergency: '24/7',
  },
  gallery: [
    '/images/services/plumbing-1.jpg',
    '/images/services/plumbing-2.jpg',
    '/images/services/plumbing-3.jpg',
  ],
  reviews: [
    {
      id: 1,
      user: {
        name: 'John Smith',
        image: '/images/users/user-1.jpg',
      },
      rating: 5,
      date: '2025-08-28',
      comment: 'Excellent service! Fixed our emergency leak quickly and professionally.',
      response: {
        date: '2025-08-28',
        comment: 'Thank you for your kind review, John! We're glad we could help.',
      },
    },
    // Add more reviews...
  ],
};

export default function ServiceProviderPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = useState(provider.services[0].name);
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="flex items-start gap-4 mb-6">
                <Image
                  src={provider.gallery[0]}
                  alt={provider.name}
                  width={120}
                  height={120}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {provider.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {provider.responseTime} response
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="ml-1 font-medium">{provider.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({provider.reviews} reviews)
                    </span>
                    {provider.verified && (
                      <Badge className="bg-green-500 ml-2">Verified</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="p-4 text-center">
                  <Briefcase className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-medium">{provider.completedJobs}+</div>
                  <div className="text-sm text-muted-foreground">Jobs Done</div>
                </Card>
                <Card className="p-4 text-center">
                  <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-medium">{provider.experience}</div>
                  <div className="text-sm text-muted-foreground">Experience</div>
                </Card>
                <Card className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-medium">{provider.team}</div>
                  <div className="text-sm text-muted-foreground">Team Size</div>
                </Card>
              </div>

              <div className="space-y-2 mb-6">
                <h2 className="text-xl font-semibold">About Us</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {provider.description}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Certifications & Insurance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.certifications.map((cert) => (
                    <Card key={cert.name} className="p-4">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {cert.issuer} • {cert.year}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <div className="font-medium">Public Liability Insurance</div>
                        <div className="text-sm text-muted-foreground">
                          {provider.insurance.coverage} coverage
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            <div className="md:w-1/3">
              <Card className="p-6 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Book a Service</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Select Service
                    </label>
                    <Select
                      value={selectedService}
                      onValueChange={setSelectedService}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {provider.services.map((service) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name} - {service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Select Date
                    </label>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Preferred Time
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                        <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">Book Now</Button>

                  <div className="text-sm text-muted-foreground text-center">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    Usually responds within {provider.responseTime}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Reviews */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="services">
            <TabsList className="mb-8">
              <TabsTrigger value="services">Services & Pricing</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {provider.services.map((service) => (
                  <Card key={service.name} className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold text-primary">
                          {service.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Duration: {service.duration}
                        </div>
                      </div>
                      <Button>Book Now</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {provider.gallery.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square cursor-pointer"
                    onClick={() => setShowGallery(true)}
                  >
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                {provider.reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{review.user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {review.comment}
                        </p>
                        {review.response && (
                          <Card className="p-4 bg-muted">
                            <div className="text-sm font-medium mb-1">
                              Response from {provider.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {review.response.comment}
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Gallery Dialog */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {provider.gallery.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={image}
                  alt={`Gallery image ${index + 1}`}
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