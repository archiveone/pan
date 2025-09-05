'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Filter,
  ChevronDown,
  Euro,
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

// Sample property data
const properties = [
  {
    id: 1,
    title: 'Modern Apartment in City Center',
    description: 'Beautiful modern apartment with stunning city views and high-end finishes.',
    location: 'Dublin 2',
    price: 2500,
    type: 'Apartment',
    status: 'For Rent',
    beds: 2,
    baths: 2,
    sqm: 85,
    features: ['Parking', 'Balcony', 'Gym'],
    images: ['/images/properties/apartment-1.jpg'],
    agent: {
      name: 'Sarah Johnson',
      image: '/images/agents/agent-1.jpg',
      phone: '+353 1 234 5678',
    },
  },
  // Add more properties...
];

const propertyTypes = [
  'Apartment',
  'House',
  'Villa',
  'Studio',
  'Penthouse',
  'Commercial',
];

const amenities = [
  'Parking',
  'Balcony',
  'Gym',
  'Pool',
  'Security',
  'Elevator',
  'Garden',
  'Storage',
];

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Property</h1>
          <p className="text-xl opacity-90 mb-8">
            Browse through our curated selection of properties
          </p>

          {/* Search Bar */}
          <Card className="p-4 bg-white/10 backdrop-blur-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                  <Input
                    placeholder="Search properties..."
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
                    <SheetTitle>Filter Properties</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Price Range (€)
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={10000}
                        step={100}
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>€{priceRange[0]}</span>
                        <span>€{priceRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Property Type
                      </label>
                      <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Amenities
                      </label>
                      <div className="space-y-2">
                        {amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center">
                            <Checkbox
                              id={amenity}
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAmenities([...selectedAmenities, amenity]);
                                } else {
                                  setSelectedAmenities(
                                    selectedAmenities.filter((a) => a !== amenity)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={amenity}
                              className="ml-2 text-sm font-medium"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Button className="w-full md:w-auto">Search</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {properties.length} Properties Available
              </h2>
              <p className="text-muted-foreground">
                Browse through our selection
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={viewType}
                onValueChange={(value: 'grid' | 'list') => setViewType(value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {properties.map((property) => (
              <Link href={`/properties/${property.id}`} key={property.id}>
                <Card className={`overflow-hidden group hover:shadow-lg transition-shadow ${
                  viewType === 'list' ? 'flex' : ''
                }`}>
                  <div className={`relative ${viewType === 'list' ? 'w-1/3' : ''}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      {property.status}
                    </Badge>
                  </div>
                  <div className={`p-4 ${viewType === 'list' ? 'w-2/3' : ''}`}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {property.location}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                    {viewType === 'list' && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    )}
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
                      <span className="text-primary font-semibold">
                        €{property.price}/month
                      </span>
                      <Button variant="ghost" size="sm">
                        View Details
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