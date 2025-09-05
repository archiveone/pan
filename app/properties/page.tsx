import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@/components/ui/slider';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
} from 'lucide-react';

// Mock data for properties
const properties = [
  {
    id: 1,
    title: 'Luxury Waterfront Apartment',
    location: 'Dublin 2, Ireland',
    price: '€2,500,000',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: '150 m²',
    image: '/images/property-1.jpg',
    featured: true,
  },
  {
    id: 2,
    title: 'Modern City Center Penthouse',
    location: 'Dublin 1, Ireland',
    price: '€1,800,000',
    type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 3,
    area: '200 m²',
    image: '/images/property-2.jpg',
    featured: false,
  },
  // Add more properties...
];

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [propertyType, setPropertyType] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              Find Your Perfect Property in Ireland
            </h1>
            <p className="text-xl text-muted-foreground">
              Browse through our curated selection of premium properties
            </p>
          </motion.div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Price Range</p>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={5000000}
                    step={100000}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>€{priceRange[0].toLocaleString()}</span>
                    <span>€{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                <Button className="h-10">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Properties */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {properties.filter(p => p.featured).map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group"
                  >
                    <Card className="overflow-hidden">
                      <div className="relative aspect-video">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 space-x-2">
                          <Button size="icon" variant="secondary" className="rounded-full">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="rounded-full">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 mr-2" />
                          {property.location}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-2" />
                            <span>{property.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-2" />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-2" />
                            <span>{property.area}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold">{property.price}</p>
                          <Button>View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* All Properties */}
          <section>
            <h2 className="text-2xl font-bold mb-6">All Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group"
                  >
                    <Card className="overflow-hidden">
                      <div className="relative aspect-video">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 space-x-2">
                          <Button size="icon" variant="secondary" className="rounded-full">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="rounded-full">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 mr-2" />
                          {property.location}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-2" />
                            <span>{property.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-2" />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-2" />
                            <span>{property.area}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold">{property.price}</p>
                          <Button>View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}