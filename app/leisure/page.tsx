'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  Users,
  Music,
  Utensils,
  Plane,
  Car,
  Boat,
  Ticket,
  Clock,
  Euro,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';

// Leisure categories
const categories = [
  { id: 'events', name: 'Events', icon: Music },
  { id: 'dining', name: 'Dining', icon: Utensils },
  { id: 'travel', name: 'Travel', icon: Plane },
  { id: 'cars', name: 'Car Rental', icon: Car },
  { id: 'boats', name: 'Boat Rental', icon: Boat },
  { id: 'activities', name: 'Activities', icon: Users },
];

// Sample leisure items
const leisureItems = [
  {
    id: 1,
    type: 'event',
    title: 'Summer Music Festival 2025',
    description: 'Three days of live music featuring top international artists',
    location: 'Phoenix Park, Dublin',
    date: '2025-07-15',
    time: '12:00 PM',
    price: 'From €45',
    image: '/images/leisure/festival-1.jpg',
    category: 'Music',
    attendees: 5000,
    rating: 4.8,
    reviews: 245,
    featured: true,
    organizer: {
      name: 'EventPro Ireland',
      verified: true,
    },
  },
  {
    id: 2,
    type: 'rental',
    title: 'Luxury Yacht Experience',
    description: 'Private yacht rental with captain and crew',
    location: 'Dun Laoghaire Harbour',
    price: '€500/hour',
    image: '/images/leisure/yacht-1.jpg',
    category: 'Boat Rental',
    capacity: 12,
    rating: 4.9,
    reviews: 78,
    featured: true,
    provider: {
      name: 'Premium Marine',
      verified: true,
    },
  },
  // Add more items...
];

// Filter options
const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'date', label: 'Date: Nearest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function LeisurePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Experiences</h1>
          <p className="text-xl opacity-90 mb-8">
            Find and book unique experiences, events, and rentals
          </p>

          {/* Search Bar */}
          <Card className="p-4 bg-white/10 backdrop-blur-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                  <Input
                    placeholder="Search events, activities, rentals..."
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
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" className="w-full md:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Options</SheetTitle>
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
                        max={1000}
                        step={50}
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>€{priceRange[0]}</span>
                        <span>€{priceRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Category
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">{category.name}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {leisureItems.length} Experiences Available
              </h2>
              <p className="text-muted-foreground">
                Browse through our curated experiences
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
            {leisureItems.map((item) => (
              <Link href={`/leisure/${item.id}`} key={item.id}>
                <Card className={`overflow-hidden group hover:shadow-lg transition-shadow ${
                  viewType === 'list' ? 'flex' : ''
                }`}>
                  <div className={`relative ${viewType === 'list' ? 'w-1/3' : ''}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      {item.category}
                    </Badge>
                  </div>
                  <div className={`p-4 ${viewType === 'list' ? 'w-2/3' : ''}`}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    {item.date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.date).toLocaleDateString()} {item.time}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="ml-1 font-medium">{item.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({item.reviews} reviews)
                      </span>
                      {item.type === 'event' && (
                        <Badge variant="outline" className="ml-auto">
                          {item.attendees}+ attending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold">{item.price}</span>
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