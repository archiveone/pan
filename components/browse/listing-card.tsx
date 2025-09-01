'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Wrench, Calendar, MapPin, Star, Heart, User } from 'lucide-react'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    description: string
    category: string
    type: string
    price?: number
    location: string
    county: string
    images: string[]
    features?: any
    user: {
      name: string
      isLicensedAgent?: boolean
    }
    createdAt: string
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROPERTY': return <Building className="h-4 w-4" />
      case 'SERVICE': return <Wrench className="h-4 w-4" />
      case 'LEISURE': return <Calendar className="h-4 w-4" />
      default: return <Building className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROPERTY': return 'text-blue-600 bg-blue-100'
      case 'SERVICE': return 'text-green-600 bg-green-100'
      case 'LEISURE': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatPrice = (price: number, category: string) => {
    if (category === 'PROPERTY') {
      if (listing.type?.includes('RENT')) {
        return `€${price.toLocaleString()}/month`
      }
      if (price >= 1000000) {
        return `€${(price / 1000000).toFixed(1)}M`
      }
      if (price >= 1000) {
        return `€${(price / 1000).toFixed(0)}K`
      }
    }
    if (category === 'SERVICE') {
      return `€${price}/hour`
    }
    if (category === 'LEISURE') {
      return `€${price}/person`
    }
    return `€${price.toLocaleString()}`
  }

  const getActionButton = (category: string) => {
    switch (category) {
      case 'PROPERTY': return 'View Details'
      case 'SERVICE': return 'Get Quote'
      case 'LEISURE': return 'Book Now'
      default: return 'View Details'
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
      <div className="relative">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-3 left-3">
          <Badge className={`${getCategoryColor(listing.category)} border-0`}>
            {getCategoryIcon(listing.category)}
            <span className="ml-1 text-xs font-medium">{listing.category}</span>
          </Badge>
        </div>
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <CardContent className="p-6">
        <div className="mb-3">
          <Link href={`/listing/${listing.id}`}>
            <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {listing.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{listing.location}, {listing.county}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {listing.category === 'PROPERTY' && listing.features && (
            <>
              {listing.features.bedrooms && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  {listing.features.bedrooms} bed
                </span>
              )}
              {listing.features.bathrooms && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  {listing.features.bathrooms} bath
                </span>
              )}
              {listing.features.area && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  {listing.features.area}m²
                </span>
              )}
            </>
          )}
          
          {listing.category === 'SERVICE' && listing.features && (
            <>
              {listing.features.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {listing.features.rating}
                </span>
              )}
              {listing.features.completedJobs && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  {listing.features.completedJobs} jobs
                </span>
              )}
            </>
          )}

          {listing.category === 'LEISURE' && listing.features && (
            <>
              {listing.features.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(listing.features.date).toLocaleDateString()}
                </span>
              )}
              {listing.features.capacity && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  {listing.features.capacity} people
                </span>
              )}
            </>
          )}
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            {listing.price && (
              <p className="text-xl font-bold text-black">
                {formatPrice(listing.price, listing.category)}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>by {listing.user.name}</span>
              {listing.user.isLicensedAgent && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Licensed Agent
                </Badge>
              )}
            </div>
          </div>
          <Link href={`/listing/${listing.id}`}>
            <Button size="sm" className="bg-black hover:bg-gray-800">
              {getActionButton(listing.category)}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
