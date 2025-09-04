'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const propertyTypes = [
  { value: 'all', label: 'All Properties' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

const priceRanges = [
  { value: 'all', label: 'Any Price' },
  { value: '0-100000', label: 'Up to €100,000' },
  { value: '100000-200000', label: '€100,000 - €200,000' },
  { value: '200000-300000', label: '€200,000 - €300,000' },
  { value: '300000-500000', label: '€300,000 - €500,000' },
  { value: '500000-plus', label: '€500,000+' },
];

export function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const handleSearch = () => {
    const searchParams = new URLSearchParams({
      location,
      type: propertyType,
      price: priceRange,
    });
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Beautiful Irish Property"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center text-white mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Find Your Dream Home in Ireland
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            Discover the perfect property across Ireland's most beautiful locations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location Search */}
              <div className="relative col-span-2">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>

              {/* Property Type */}
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="mt-4">
              <Button 
                onClick={handleSearch} 
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Properties
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto mt-12 grid grid-cols-3 gap-8"
        >
          <div className="text-center text-white">
            <div className="text-3xl font-bold mb-1">15,000+</div>
            <div className="text-white/80">Properties Listed</div>
          </div>
          <div className="text-center text-white">
            <div className="text-3xl font-bold mb-1">10,000+</div>
            <div className="text-white/80">Happy Customers</div>
          </div>
          <div className="text-center text-white">
            <div className="text-3xl font-bold mb-1">32</div>
            <div className="text-white/80">Counties Covered</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}