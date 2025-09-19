'use client'

import { LeisureHero } from '@/components/ui/hero'
import { Filters } from '@/components/ui/filters'
import { Card } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import {
  Car,
  Ship,
  Plane,
  Ticket,
  Music,
  Utensils,
  Calendar,
  MapPin,
  Star,
  Clock,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'

export default function LeisurePage() {
  const [filters, setFilters] = useState({})

  const filterGroups = [
    {
      id: 'category',
      name: 'Category',
      type: 'button',
      options: [
        { id: 'all', name: 'All Activities' },
        { id: 'rentals', name: 'Rentals' },
        { id: 'events', name: 'Events' },
        { id: 'dining', name: 'Dining' }
      ]
    },
    {
      id: 'price',
      name: 'Price Range',
      type: 'select',
      options: [
        { id: 'all', name: 'Any Price' },
        { id: 'budget', name: 'Budget' },
        { id: 'mid', name: 'Mid-Range' },
        { id: 'luxury', name: 'Luxury' }
      ]
    },
    {
      id: 'date',
      name: 'Date',
      type: 'select',
      options: [
        { id: 'all', name: 'Any Time' },
        { id: 'today', name: 'Today' },
        { id: 'weekend', name: 'This Weekend' },
        { id: 'week', name: 'This Week' }
      ]
    }
  ]

  const categories = [
    {
      icon: Car,
      title: 'Car Rentals',
      description: 'Luxury & sports cars',
      link: '/leisure/cars'
    },
    {
      icon: Ship,
      title: 'Boat Rentals',
      description: 'Yachts & boats',
      link: '/leisure/boats'
    },
    {
      icon: Ticket,
      title: 'Events',
      description: 'Shows & performances',
      link: '/leisure/events'
    },
    {
      icon: Music,
      title: 'Live Music',
      description: 'Concerts & gigs',
      link: '/leisure/music'
    },
    {
      icon: Utensils,
      title: 'Fine Dining',
      description: 'Restaurant experiences',
      link: '/leisure/dining'
    }
  ]

  // Example leisure activities data
  const activities = [
    {
      id: 1,
      title: 'Luxury Sports Car Rental',
      subtitle: 'Ferrari 488 GTB',
      description: 'Experience the thrill of driving a supercar',
      image: 'https://placehold.co/600x400',
      price: {
        amount: 499,
        currency: '£',
        unit: 'day'
      },
      badges: {
        verified: true,
        featured: true,
        status: 'new'
      },
      stats: [
        { icon: Star, label: 'Rating', value: '4.9' },
        { icon: Clock, label: 'Duration', value: '24h' }
      ],
      actions: [
        { label: 'Book Now', href: '/leisure/rentals/1', primary: true },
        { label: 'Enquire', onClick: () => {}, icon: MessageSquare }
      ]
    },
    // Add more activities...
  ]

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <LeisureHero
          title="Discover Amazing Experiences"
          subtitle="Find unique rentals and unforgettable activities"
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Featured Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <a
                  key={index}
                  href={category.link}
                  className="flex flex-col items-center p-6 bg-card rounded-lg hover:bg-accent transition-colors"
                >
                  <Icon className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="font-medium text-center mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {category.description}
                  </p>
                </a>
              )
            })}
          </div>

          {/* Featured Events */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="relative h-48 rounded-lg overflow-hidden group"
                >
                  <img
                    src="https://placehold.co/600x400"
                    alt="Event"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white font-semibold mb-1">Event Title</h3>
                    <div className="flex items-center text-white/80 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>This Weekend</span>
                      <MapPin className="h-4 w-4 ml-2 mr-1" />
                      <span>London</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <Filters
            groups={filterGroups}
            selectedFilters={filters}
            onFilterChange={(groupId, value) => {
              setFilters(prev => ({ ...prev, [groupId]: value }))
            }}
            className="mb-8"
          />

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map(activity => (
              <Card
                key={activity.id}
                {...activity}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}