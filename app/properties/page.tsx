'use client'

import { PropertyHero } from '@/components/ui/hero'
import { Filters } from '@/components/ui/filters'
import { Card } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { Home, Bath, Bed, MapPin, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function PropertiesPage() {
  const [filters, setFilters] = useState({})

  const filterGroups = [
    {
      id: 'type',
      name: 'Property Type',
      type: 'button',
      options: [
        { id: 'all', name: 'All', icon: Home },
        { id: 'house', name: 'House' },
        { id: 'apartment', name: 'Apartment' },
        { id: 'commercial', name: 'Commercial' }
      ]
    },
    {
      id: 'price',
      name: 'Price Range',
      type: 'select',
      options: [
        { id: 'all', name: 'Any Price' },
        { id: '0-100000', name: 'Up to £100,000' },
        { id: '100000-250000', name: 'Up to £250,000' },
        { id: '250000-500000', name: 'Up to £500,000' },
        { id: '500000+', name: 'Over £500,000' }
      ]
    },
    {
      id: 'beds',
      name: 'Bedrooms',
      type: 'select',
      options: [
        { id: 'all', name: 'Any' },
        { id: '1', name: '1+' },
        { id: '2', name: '2+' },
        { id: '3', name: '3+' },
        { id: '4', name: '4+' }
      ]
    }
  ]

  // Example properties data
  const properties = [
    {
      id: 1,
      title: 'Modern City Apartment',
      subtitle: 'Central London',
      description: 'Stunning 2-bed apartment with city views',
      image: 'https://placehold.co/600x400',
      price: {
        amount: 450000,
        currency: '£'
      },
      badges: {
        verified: true,
        featured: true
      },
      stats: [
        { icon: Bed, label: 'Beds', value: 2 },
        { icon: Bath, label: 'Baths', value: 2 },
        { icon: MapPin, label: 'Location', value: 'Central' }
      ],
      actions: [
        { label: 'View Details', href: '/properties/1', primary: true },
        { label: 'Contact Agent', onClick: () => {}, icon: ArrowRight }
      ]
    },
    // Add more properties...
  ]

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <PropertyHero
          title="Find Your Perfect Property"
          subtitle="Browse through thousands of verified properties"
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <Filters
            groups={filterGroups}
            selectedFilters={filters}
            onFilterChange={(groupId, value) => {
              setFilters(prev => ({ ...prev, [groupId]: value }))
            }}
            className="mb-8"
          />

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <Card
                key={property.id}
                {...property}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}