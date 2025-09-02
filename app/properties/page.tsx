'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useProperties } from '@/hooks/use-properties'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export default function PropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // Get initial filter values from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'all')
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'all')
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || 'all')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  // Parse price range into min/max values
  const getPriceRangeValues = (range: string) => {
    switch (range) {
      case '0-100000':
        return { minPrice: 0, maxPrice: 100000 }
      case '100000-250000':
        return { minPrice: 100000, maxPrice: 250000 }
      case '250000-500000':
        return { minPrice: 250000, maxPrice: 500000 }
      case '500000+':
        return { minPrice: 500000 }
      default:
        return {}
    }
  }

  // Fetch properties with filters
  const { properties, pagination, isLoading } = useProperties({
    page,
    limit: 9,
    search: searchTerm || undefined,
    propertyType: propertyType !== 'all' ? propertyType : undefined,
    listingType: listingType !== 'all' ? listingType : undefined,
    ...getPriceRangeValues(priceRange),
  })

  // Update URL with filters
  const updateFilters = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (propertyType !== 'all') params.set('propertyType', propertyType)
    if (listingType !== 'all') params.set('listingType', listingType)
    if (priceRange !== 'all') params.set('priceRange', priceRange)
    if (page > 1) params.set('page', page.toString())
    
    router.push(\`/properties?\${params.toString()}\`)
  }

  // Handle filter changes
  const handleFilterChange = () => {
    setPage(1) // Reset to first page when filters change
    updateFilters()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-bold mb-4 md:mb-0">Properties Marketplace</h1>
        {session && (
          <Button onClick={() => router.push('/properties/new')}>
            + Add Property Listing
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            handleFilterChange()
          }}
          className="w-full"
        />
        
        <Select 
          value={propertyType} 
          onValueChange={(value) => {
            setPropertyType(value)
            handleFilterChange()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="HOUSE">House</SelectItem>
            <SelectItem value="APARTMENT">Apartment</SelectItem>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            <SelectItem value="LAND">Land</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={listingType} 
          onValueChange={(value) => {
            setListingType(value)
            handleFilterChange()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Listing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="SALE">For Sale</SelectItem>
            <SelectItem value="RENT">For Rent</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={priceRange} 
          onValueChange={(value) => {
            setPriceRange(value)
            handleFilterChange()
          }}
        >
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
      <PropertyGrid properties={properties} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={page === 1 || isLoading}
            onClick={() => {
              setPage(page - 1)
              updateFilters()
            }}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                disabled={isLoading}
                onClick={() => {
                  setPage(pageNum)
                  updateFilters()
                }}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={page === pagination.pages || isLoading}
            onClick={() => {
              setPage(page + 1)
              updateFilters()
            }}
          >
            Next
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center mt-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
    </div>
  )
}