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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SearchTab = 'properties' | 'services' | 'leisure' | 'connect';

const searchTabs = [
  {
    id: 'properties',
    label: 'Properties',
    icon: Building,
    placeholder: 'Search for properties...',
  },
  {
    id: 'services',
    label: 'Services',
    icon: Wrench,
    placeholder: 'Find local services...',
  },
  {
    id: 'leisure',
    label: 'Leisure',
    icon: PartyPopper,
    placeholder: 'Discover experiences...',
  },
  {
    id: 'connect',
    label: 'Connect',
    icon: Network,
    placeholder: 'Find people...',
  },
];

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<SearchTab>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  return (
    <div className="min-h-screen">
      {/* Hero Section with Curved Design */}
      <section className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 greia-gradient-blue overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          
          {/* Curved Shape */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
              preserveAspectRatio="none"
            >
              <path
                d="M0 160V0C240 53.3333 480 80 720 80C960 80 1200 53.3333 1440 0V160H0Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative pt-24 pb-48">
          <div className="container mx-auto px-4">
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

            {/* Apple-style Search with Tabs */}
            <div className="max-w-4xl mx-auto">
              <Card className="p-4 md:p-6 backdrop-blur-xl bg-white/90">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as SearchTab)}
                  className="mb-6"
                >
                  <TabsList className="grid grid-cols-4 gap-4">
                    {searchTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center gap-2 py-3"
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={searchTabs.find(tab => tab.id === activeTab)?.placeholder}
                        className="pl-10 h-12 bg-white"
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
                        className="pl-10 h-12 bg-white"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button size="lg" className="h-12 px-8 greia-gradient-blue text-white">
                    Search
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
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

      {/* CTA Section */}
      <section className="py-16 greia-gradient-blue relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
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