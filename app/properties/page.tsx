'use client'

import { useState } from 'react'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

// Temporary mock data - will be replaced with API calls
const mockProperties = [
  {
    id: '1',
    title: 'Modern 3-Bedroom House',
    price: 450000,
    location: 'London, UK',
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    listingType: 'sale',
    imageUrl: '/mock/property1.jpg',
  },
  {
    id: '2',
    title: 'Luxury City Apartment',
    price: 2500,
    location: 'Manchester, UK',
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'apartment',
    listingType: 'rent',
    imageUrl: '/mock/property2.jpg',
  },
] as const

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [propertyType, setPropertyType] = useState('all')
  const [listingType, setListingType] = useState('all')
  const [priceRange, setPriceRange] = useState('all')

  // Filter properties based on search criteria
  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPropertyType = propertyType === 'all' || property.propertyType === propertyType
    const matchesListingType = listingType === 'all' || property.listingType === listingType
    
    // Add price range filtering logic here
    return matchesSearch && matchesPropertyType && matchesListingType
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-bold mb-4 md:mb-0">Properties Marketplace</h1>
        <Button>+ Add Property Listing</Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>

        <Select value={listingType} onValueChange={setListingType}>
          <SelectTrigger>
            <SelectValue placeholder="Listing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-100000">Up to £100,000</SelectItem>
            <SelectItem value="100000-250000">£100,000 - £250,000</SelectItem>
            <SelectItem value="250000-500000">£250,000 - £500,000</SelectItem>
            <SelectItem value="500000+">£500,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Grid */}
      <PropertyGrid properties={filteredProperties} />
    </div>
  )
}