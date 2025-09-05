'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home,
  Briefcase,
  Ticket,
  Users,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  Building,
  Wrench,
  PartyPopper,
  Network,
  Euro,
  Star,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Clock,
  Bath,
  BedDouble,
  Square,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Featured Listings Data
const featuredProperties = [
  {
    id: 1,
    title: 'Modern Apartment in City Center',
    location: 'Dublin 2',
    price: '€2,500/month',
    image: '/images/properties/apartment-1.jpg',
    beds: 2,
    baths: 2,
    sqm: 85,
    type: 'Apartment',
    featured: true,
  },
  {
    id: 2,
    title: 'Luxury Villa with Sea View',
    location: 'Howth, Dublin',
    price: '€750,000',
    image: '/images/properties/villa-1.jpg',
    beds: 4,
    baths: 3,
    sqm: 220,
    type: 'House',
    featured: true,
  },
  {
    id: 3,
    title: 'Cozy Studio near University',
    location: 'Dublin 8',
    price: '€1,800/month',
    image: '/images/properties/studio-1.jpg',
    beds: 1,
    baths: 1,
    sqm: 45,
    type: 'Studio',
    featured: true,
  },
];

const featuredServices = [
  {
    id: 1,
    title: 'Professional Plumbing Services',
    provider: 'Mike\'s Plumbing',
    location: 'Greater Dublin Area',
    price: 'From €80/hour',
    image: '/images/services/plumbing-1.jpg',
    rating: 4.8,
    reviews: 156,
    verified: true,
  },
  {
    id: 2,
    title: 'Expert Electrical Work',
    provider: 'Dublin Electricians',
    location: 'Dublin City',
    price: 'From €75/hour',
    image: '/images/services/electrical-1.jpg',
    rating: 4.9,
    reviews: 203,
    verified: true,
  },
  {
    id: 3,
    title: 'Interior Design Consultation',
    provider: 'Creative Spaces',
    location: 'Dublin & Surrounding',
    price: '€150/consultation',
    image: '/images/services/design-1.jpg',
    rating: 5.0,
    reviews: 89,
    verified: true,
  },
];

const featuredLeisure = [
  {
    id: 1,
    title: 'Summer Music Festival 2025',
    location: 'Phoenix Park',
    date: 'July 15-17, 2025',
    price: 'From €45',
    image: '/images/leisure/festival-1.jpg',
    category: 'Music',
    attendees: 5000,
  },
  {
    id: 2,
    title: 'Food & Wine Experience',
    location: 'Dublin Castle',
    date: 'August 5, 2025',
    price: '€75/person',
    image: '/images/leisure/food-1.jpg',
    category: 'Food & Drink',
    attendees: 500,
  },
  {
    id: 3,
    title: 'Coastal Yacht Tour',
    location: 'Dun Laoghaire',
    date: 'Daily Tours',
    price: '€120/person',
    image: '/images/leisure/yacht-1.jpg',
    category: 'Adventure',
    attendees: 12,
  },
];

// Footer Links
const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Safety Center', href: '/safety' },
    { label: 'Community Guidelines', href: '/guidelines' },
    { label: 'Contact Us', href: '/contact' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Licenses', href: '/licenses' },
  ],
  features: [
    { label: 'Properties', href: '/properties' },
    { label: 'Services', href: '/services' },
    { label: 'Leisure', href: '/leisure' },
    { label: 'Connect', href: '/connect' },
  ],
};

export default function Home() {
  // ... (previous code remains the same until Categories section)

  return (
    <div className="min-h-screen">
      {/* ... (previous sections remain the same) */}

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Discover your perfect home</p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              View All Properties
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden group">
                <div className="relative">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-primary">
                    {property.type}
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4" />
                      {property.beds} beds
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {property.baths} baths
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      {property.sqm}m²
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">{property.price}</span>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Top Services</h2>
              <p className="text-muted-foreground">Professional services you can trust</p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              View All Services
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden group">
                <div className="relative">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {service.verified && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{service.provider}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="ml-1 font-medium">{service.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({service.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">{service.price}</span>
                    <Button variant="ghost" size="sm">
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Leisure */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Discover exciting experiences</p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              View All Events
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLeisure.map((event) => (
              <Card key={event.id} className="overflow-hidden group">
                <div className="relative">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-primary">
                    {event.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendees}+ attending
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">{event.price}</span>
                    <Button variant="ghost" size="sm">
                      Get Tickets
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <Image
                src="/images/greia-logo-white.png"
                alt="GREIA"
                width={120}
                height={40}
                className="mb-6"
              />
              <p className="text-gray-400 mb-6">
                Life's Operating System - One platform for properties, services, leisure, and networking.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white">
                  <LinkedIn className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 GREIA. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
                  Terms
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
                  Privacy
                </Link>
                <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}