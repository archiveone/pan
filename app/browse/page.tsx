'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ListingCard from '@/components/browse/listing-card'
import Filters from '@/components/browse/filters'
import { Search, MapPin, SlidersHorizontal, Grid, List } from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const mockListings = [
  {
    id: '1',
    title: 'Modern 3-Bed Apartment in Dublin City Centre',
    description: 'Stunning modern apartment with panoramic city views, fully furnished with high-end appliances. Walking distance to Trinity College and Temple Bar.',
    category: 'PROPERTY',
    type: 'APARTMENT_RENT',
    price: 2500,
    location: 'Dublin City Centre',
    county: 'Dublin',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    features: { bedrooms: 3, bathrooms: 2, area: 120 },
    user: { name: 'Dublin Properties Ltd', isLicensedAgent: true },
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Professional Home Cleaning Service',
    description: 'Reliable and thorough cleaning service for homes and offices. Fully insured with eco-friendly products. Available 7 days a week.',
    category: 'SERVICE',
    type: 'PROFESSIONAL_SERVICE',
    price: 80,
    location: 'Dublin',
    county: 'Dublin',
    images: ['/api/placeholder/400/300'],
    features: { rating: 4.9, completedJobs: 150 },
    user: { name: 'CleanPro Ireland', isLicensedAgent: false },
    createdAt: '2025-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'Traditional Irish Music Session',
    description: 'Join us for an authentic Irish music session in a cozy pub setting. Learn traditional songs and enjoy local craft beer.',
    category: 'LEISURE',
    type: 'ENTERTAINMENT',
    price: 25,
    location: 'Temple Bar',
    county: 'Dublin',
    images: ['/api/placeholder/400/300'],
    features: { date: '2025-02-01', capacity: 30 },
    user: { name: 'Dublin Music Tours', isLicensedAgent: false },
    createdAt: '2025-01-13T09:15:00Z'
  },
  {
    id: '4',
    title: 'Luxury Villa with Sea Views',
    description: 'Breathtaking 5-bedroom villa overlooking the Atlantic Ocean. Private pool, landscaped gardens, and direct beach access.',
    category: 'PROPERTY',
    type: 'LUXURY_SALE',
    price: 1250000,
    location: 'Dingle Peninsula',
    county: 'Kerry',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
    features: { bedrooms: 5, bathrooms: 4, area: 350 },
    user: { name: 'Kerry Luxury Estates', isLicensedAgent: true },
    createdAt: '2025-01-12T14:20:00Z'
  },
  {
    id: '5',
    title: 'Web Development & Design Services',
    description: 'Full-stack web development services for businesses. Specializing in React, Node.js, and modern web technologies.',
    category: 'SERVICE',
    type: 'FREELANCER',
    price: 75,
    location: 'Cork',
    county: 'Cork',
    images: ['/api/placeholder/400/300'],
    features: { rating: 4.8, completedJobs: 85 },
    user: { name: 'TechCraft Solutions', isLicensedAgent: false },
    createdAt: '2025-01-11T11:45:00Z'
  },
  {
    id: '6',
    title: 'Cliffs of Moher Photography Tour',
    description: 'Professional photography tour of the iconic Cliffs of Moher. Perfect for beginners and experienced photographers alike.',
    category: 'LEISURE',
    type: 'TOUR',
    price: 120,
    location: 'Cliffs of Moher',
    county: 'Clare',
    images: ['/api/placeholder/400/300'],
    features: { date: '2025-02-05', capacity: 12 },
    user: { name: 'Wild Atlantic Photography', isLicensedAgent: false },
    createdAt: '2025-01-10T16:30:00Z'
  }
]

export default function BrowsePage() {
  const [listings, setListings] = useState(mockListings)
  const [filteredListings, setFilteredListings] = useState(mockListings)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const handleFiltersChange = (filters: any) => {
    let filtered = [...listings]

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(listing => listing.category === filters.category)
    }

    // Apply county filter
    if (filters.county) {
      filtered = filtered.filter(listing => listing.county === filters.county)
    }

    // Apply price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      filtered = filtered.filter(listing => {
        if (!listing.price) return true
        return listing.price >= filters.priceRange[0] && listing.price <= filters.priceRange[1]
      })
    }

    // Apply property-specific filters
    if (filters.bedrooms && filters.category === 'PROPERTY') {
      filtered = filtered.filter(listing => 
        listing.features?.bedrooms >= parseInt(filters.bedrooms)
      )
    }

    if (filters.bathrooms && filters.category === 'PROPERTY') {
      filtered = filtered.filter(listing => 
        listing.features?.bathrooms >= parseInt(filters.bathrooms)
      )
    }

    // Apply service rating filter
    if (filters.rating && filters.category === 'SERVICE') {
      filtered = filtered.filter(listing => 
        listing.features?.rating >= parseFloat(filters.rating)
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
    }

    setFilteredListings(filtered)
  }

  useEffect(() => {
    handleFiltersChange({
      category: '',
      county: '',
      priceRange: [0, 1000000],
      bedrooms: '',
      bathrooms: '',
      rating: '',
      verified: false
    })
  }, [searchTerm, sortBy])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <h1 className="text-2xl font-bold">Greia</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/create-listing">
                <Button>List Your Property</Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search properties, services, or experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 shrink-0">
              <Filters onFiltersChange={handleFiltersChange} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {filteredListings.length} listings found
                </h2>
                <p className="text-gray-600">
                  Discover properties, services, and experiences across Ireland
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {listings.filter(l => l.category === 'PROPERTY').length}
                </div>
                <div className="text-sm text-gray-600">Properties</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-green-600">
                  {listings.filter(l => l.category === 'SERVICE').length}
                </div>
                <div className="text-sm text-gray-600">Services</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {listings.filter(l => l.category === 'LEISURE').length}
                </div>
                <div className="text-sm text-gray-600">Experiences</div>
              </div>
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={() => {
                  setSearchTerm('')
                  handleFiltersChange({
                    category: '',
                    county: '',
                    priceRange: [0, 1000000],
                    bedrooms: '',
                    bathrooms: '',
                    rating: '',
                    verified: false
                  })
                }}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredListings.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Listings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
