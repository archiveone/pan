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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const categories = [
  {
    name: 'Properties',
    icon: Home,
    description: 'Find your perfect home',
    link: '/properties',
  },
  {
    name: 'Services',
    icon: Briefcase,
    description: 'Professional services',
    link: '/services',
  },
  {
    name: 'Leisure',
    icon: Ticket,
    description: 'Events and activities',
    link: '/leisure',
  },
  {
    name: 'Connect',
    icon: Users,
    description: 'Network and socialize',
    link: '/connect',
  },
];

const featuredListings = [
  {
    id: 1,
    type: 'property',
    title: 'Luxury Apartment',
    location: 'Dublin City Center',
    image: '/images/listings/property-1.jpg',
    price: '€2,500/month',
  },
  {
    id: 2,
    type: 'service',
    title: 'Professional Plumber',
    location: 'Greater Dublin Area',
    image: '/images/listings/service-1.jpg',
    price: 'From €80/hour',
  },
  {
    id: 3,
    type: 'leisure',
    title: 'Summer Music Festival',
    location: 'Phoenix Park',
    image: '/images/listings/leisure-1.jpg',
    price: '€45/ticket',
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="greia-hero">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/greia-logo-white.png"
                alt="GREIA"
                width={200}
                height={80}
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Life's Operating System
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              One platform for properties, services, leisure, and networking
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="What are you looking for?"
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Location"
                      className="pl-10"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                </div>
                <Button size="lg" className="greia-gradient-blue text-white">
                  Search
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explore Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link href={category.link} key={category.name}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                        <category.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Featured Listings</h2>
            <Button variant="outline">
              View All
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden group">
                <div className="relative h-48">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">{listing.price}</span>
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

      {/* CTA Section */}
      <section className="py-16 greia-gradient-blue">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join GREIA today and discover a world of opportunities
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">
              Learn More
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Sign Up Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}