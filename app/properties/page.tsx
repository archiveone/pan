'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyType } from '@prisma/client';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  type: PropertyType;
  images?: string[];
}

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [propertyType, setPropertyType] = useState<PropertyType | 'ALL'>('ALL');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Property Listings</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />
          
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType | 'ALL')}
            className="border rounded-md p-2"
          >
            <option value="ALL">All Types</option>
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="LAND">Land</option>
          </select>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              className="w-24"
            />
            <span className="self-center">to</span>
            <Input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              className="w-24"
            />
          </div>

          <Button>Search</Button>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property Card Component - Will be populated with real data */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-200 rounded-md mb-4"></div>
            <p className="text-2xl font-bold">£350,000</p>
            <p className="text-gray-600">123 Sample Street, London</p>
            <p className="text-sm text-gray-500 mt-2">
              3 Bedrooms • 2 Bathrooms • 1,500 sq ft
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">View Details</Button>
            <Button>Contact Agent</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}