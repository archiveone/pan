'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Filter,
  Clock,
  Calendar,
  Briefcase,
  Award,
  Shield,
  CheckCircle,
  Euro,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample service categories
const serviceCategories = [
  { id: 'trades', name: 'Trades & Construction', icon: Briefcase },
  { id: 'home', name: 'Home Services', icon: Home },
  { id: 'health', name: 'Health & Wellness', icon: Heart },
  { id: 'education', name: 'Education & Tutoring', icon: GraduationCap },
  { id: 'tech', name: 'Technology', icon: Laptop },
  { id: 'events', name: 'Events & Entertainment', icon: Music },
];

// Sample services data
const services = [
  {
    id: 1,
    title: 'Professional Plumbing Services',
    provider: {
      name: "Mike's Plumbing",
      image: '/images/providers/plumber-1.jpg',
      verified: true,
      rating: 4.8,
      reviews: 156,
      experience: '12 years',
    },
    category: 'trades',
    location: 'Dublin City',
    price: 'From €80/hour',
    availability: 'Available Today',
    description: 'Expert plumbing services for residential and commercial properties. Emergency callouts available.',
    services: [
      'Emergency Repairs',
      'Installation',
      'Maintenance',
      'Bathroom Fitting',
    ],
    insurance: true,
    certifications: ['Licensed', 'Insured', 'SafeWork Certified'],
    response: '1 hour',
    images: ['/images/services/plumbing-1.jpg'],
  },
  // Add more services...
];

// Filter options
const sortOptions = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'availability', label: 'Availability' },
];

const availabilityOptions = [
  { value: 'today', label: 'Available Today' },
  { value: 'week', label: 'This Week' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'anytime', label: 'Anytime' },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('rating');
  const [availability, setAvailability] = useState('anytime');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Find Trusted Service Providers</h1>
          <p className="text-xl opacity-90 mb-8">
            Connect with verified professionals for all your service needs
          </p>

          {/* Search Bar */}
          <Card className="p-4 bg-white/10 backdrop-blur-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                  <Input
                    placeholder="What service do you need?"
                    className="pl-10 bg-white text-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                  <Input
                    placeholder="Location"
                    className="pl-10 bg-white text-black"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" className="w-full md:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Services</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Price Range (€/hour)
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={200}
                        step={10}
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>€{priceRange[0]}</span>
                        <span>€{priceRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Availability
                      </label>
                      <Select value={availability} onValueChange={setAvailability}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Verified Only</label>
                        <p className="text-sm text-muted-foreground">
                          Show only verified providers
                        </p>
                      </div>
                      <Switch
                        checked={verifiedOnly}
                        onCheckedChange={setVerifiedOnly}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Button className="w-full md:w-auto">Search</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {serviceCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {services.length} Services Available
              </h2>
              <p className="text-muted-foreground">
                Browse through our verified providers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {services.map((service) => (
              <Link href={`/services/${service.id}`} key={service.id}>
                <Card className={`overflow-hidden group hover:shadow-lg transition-shadow ${
                  viewType === 'list' ? 'flex' : ''
                }`}>
                  <div className={`relative ${viewType === 'list' ? 'w-1/3' : ''}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={service.images[0]}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {service.provider.verified && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className={`p-4 ${viewType === 'list' ? 'w-2/3' : ''}`}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {service.location}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.provider.name}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="ml-1 font-medium">
                          {service.provider.rating}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({service.provider.reviews} reviews)
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        {service.availability}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold">
                        {service.price}
                      </span>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}