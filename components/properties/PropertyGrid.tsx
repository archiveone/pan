'use client'

import { PropertyCard } from './PropertyCard'

interface Property {
  id: string
  title: string
  price: number
  currency?: string
  location: string
  bedrooms?: number
  bathrooms?: number
  propertyType: string
  listingType: 'sale' | 'rent'
  imageUrl: string
}

interface PropertyGridProps {
  properties: Property[]
  isLoading?: boolean
}

export function PropertyGrid({ properties, isLoading = false }: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="h-[400px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No properties found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or check back later for new listings.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          {...property}
        />
      ))}
    </div>
  )
}