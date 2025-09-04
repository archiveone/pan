'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Briefcase, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  {
    id: 'properties',
    label: 'Properties',
    icon: Building2,
    placeholder: 'Search properties...',
    types: [
      { value: 'all', label: 'All Properties' },
      { value: 'buy', label: 'For Sale' },
      { value: 'rent', label: 'For Rent' },
      { value: 'commercial', label: 'Commercial' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    icon: Briefcase,
    placeholder: 'Search services...',
    types: [
      { value: 'all', label: 'All Services' },
      { value: 'trades', label: 'Trades' },
      { value: 'professional', label: 'Professional' },
      { value: 'creative', label: 'Creative' },
    ],
  },
  {
    id: 'leisure',
    label: 'Leisure',
    icon: Compass,
    placeholder: 'Search experiences...',
    types: [
      { value: 'all', label: 'All Leisure' },
      { value: 'rentals', label: 'Rentals' },
      { value: 'experiences', label: 'Experiences' },
      { value: 'venues', label: 'Venues' },
    ],
  },
];

export function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('properties');
  const [searchType, setSearchType] = useState('all');
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const searchParams = new URLSearchParams({
      type: searchType,
      location,
      q: query,
    });
    router.push(`/${activeTab}/search?${searchParams.toString()}`);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="GREIA Platform"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="hero-title mb-6"
          >
            Life's Operating System
          </motion.h1>
          
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hero-subtitle text-white/90 mb-8"
          >
            Your unified platform for Properties, Services, Leisure, and Networking.
            Find what you need, connect with professionals, and manage your lifestyle
            in one place.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-background/95 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
            <Tabs
              defaultValue="properties"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center space-x-2"
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          type="text"
                          placeholder={category.placeholder}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.types.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={handleSearch} size="lg" className="md:w-auto w-full">
                      Search
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">Service Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2,000+</div>
                <div className="text-sm text-muted-foreground">Experiences</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center items-center space-x-8 mt-12"
        >
          <Image
            src="/trust-badge-1.svg"
            alt="Trust Badge"
            width={100}
            height={40}
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/trust-badge-2.svg"
            alt="Trust Badge"
            width={100}
            height={40}
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          <Image
            src="/trust-badge-3.svg"
            alt="Trust Badge"
            width={100}
            height={40}
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </motion.div>
      </div>
    </div>
  );
}