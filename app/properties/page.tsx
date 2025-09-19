'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  MapPin, 
  Home, 
  Building2, 
  Hotel,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  ArrowRight,
  Filter
} from 'lucide-react'

export default function PropertiesPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPrice, setSelectedPrice] = useState('all')

  const propertyTypes = [
    { id: 'all', name: 'All Properties', icon: Home },
    { id: 'residential', name: 'Residential', icon: Home },
    { id: 'commercial', name: 'Commercial', icon: Building2 },
    { id: 'luxury', name: 'Luxury', icon: Hotel },
  ]

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: '0-100000', name: 'Up to £100,000' },
    { id: '100000-250000', name: '£100,000 - £250,000' },
    { id: '250000-500000', name: '£250,000 - £500,000' },
    { id: '500000-plus', name: '£500,000+' },
  ]

  const featuredProperties = [
    {
      id: 1,
      title: 'Modern City Apartment',
      type: 'residential',
      price: 425000,
      location: 'Manchester City Centre',
      bedrooms: 2,
      bathrooms: 2,
      area: 850,
      image: '/images/properties/modern-apartment.jpg',
      featured: true,
    },
    {
      id: 2,
      title: 'Luxury Penthouse',
      type: 'luxury',
      price: 1250000,
      location: 'Liverpool Waterfront',
      bedrooms: 3,
      bathrooms: 3,
      area: 2200,
      image: '/images/properties/luxury-penthouse.jpg',
      featured: true,
    },
    {
      id: 3,
      title: 'Commercial Office Space',
      type: 'commercial',
      price: 750000,
      location: 'Leeds Business District',
      area: 3500,
      image: '/images/properties/office-space.jpg',
      featured: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="greia-hero h-[400px]">
        <div className="greia-hero-image">
          <img
            src="/images/properties-hero.jpg"
            alt="Properties"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="greia-hero-overlay" />
        <div className="greia-container relative z-10">
          <div className="greia-hero-content text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Find Your Perfect Property
            </h1>
            <p className="mt-4 text-xl text-gray-200">
              Browse through thousands of verified properties
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex items-center bg-white rounded-lg shadow-lg p-2">
                <div className="flex-1 min-w-0 px-4 py-2">
                  <input
                    type="text"
                    className="w-full border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-lg"
                    placeholder="Search by location, property type, or keywords"
                  />
                </div>
                <button className="greia-button-primary ml-2">
                  <Search className="h-5 w-5" />
                  <span className="ml-2">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="greia-container py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      selectedType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="greia-select"
            >
              {priceRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
            <button className="greia-button-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Featured Properties */}
        <section className="mb-12">
          <h2 className="greia-heading-2 mb-6">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div key={property.id} className="greia-card group">
                {/* Property Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    £{property.price.toLocaleString()}
                  </p>
                  
                  {/* Property Features */}
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms} Beds</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms} Baths</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.area} sq ft</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/properties/${property.id}`}
                    className="greia-button-primary w-full text-center"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-600 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              List Your Property with GREIA
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of successful property owners and agents on our platform
            </p>
            <Link href="/properties/create" className="greia-button-secondary">
              Start Listing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}