'use client'

import { ServiceHero } from '@/components/ui/hero'
import { Filters } from '@/components/ui/filters'
import { Card } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { 
  Wrench, 
  Paintbrush, 
  Hammer, 
  Plug, 
  Leaf, 
  Shield, 
  Star, 
  MessageSquare 
} from 'lucide-react'
import { useState } from 'react'

export default function ServicesPage() {
  const [filters, setFilters] = useState({})

  const filterGroups = [
    {
      id: 'category',
      name: 'Category',
      type: 'button',
      options: [
        { id: 'all', name: 'All Services' },
        { id: 'trades', name: 'Trades' },
        { id: 'professional', name: 'Professional' },
        { id: 'specialist', name: 'Specialist' }
      ]
    },
    {
      id: 'rating',
      name: 'Rating',
      type: 'select',
      options: [
        { id: 'all', name: 'Any Rating' },
        { id: '4+', name: '4+ Stars' },
        { id: '4.5+', name: '4.5+ Stars' },
        { id: '5', name: '5 Stars Only' }
      ]
    },
    {
      id: 'availability',
      name: 'Availability',
      type: 'select',
      options: [
        { id: 'all', name: 'Any Time' },
        { id: 'today', name: 'Today' },
        { id: 'week', name: 'This Week' },
        { id: 'weekend', name: 'Weekend' }
      ]
    }
  ]

  // Example services data
  const services = [
    {
      id: 1,
      title: 'Expert Plumbing Services',
      subtitle: 'Available Today',
      description: 'Professional plumbing solutions for your home',
      image: 'https://placehold.co/600x400',
      price: {
        amount: 60,
        currency: '£',
        unit: 'hour'
      },
      badges: {
        verified: true,
        featured: true,
        status: 'popular'
      },
      stats: [
        { icon: Star, label: 'Rating', value: '4.9' },
        { icon: Shield, label: 'Verified', value: 'Pro' }
      ],
      actions: [
        { label: 'Book Now', href: '/services/1', primary: true },
        { label: 'Message', onClick: () => {}, icon: MessageSquare }
      ]
    },
    // Add more services...
  ]

  const categories = [
    {
      icon: Wrench,
      title: 'Plumbing',
      description: 'Expert plumbing services',
      link: '/services/plumbing'
    },
    {
      icon: Paintbrush,
      title: 'Decorating',
      description: 'Professional painters & decorators',
      link: '/services/decorating'
    },
    {
      icon: Hammer,
      title: 'Construction',
      description: 'Building & renovation experts',
      link: '/services/construction'
    },
    {
      icon: Plug,
      title: 'Electrical',
      description: 'Certified electricians',
      link: '/services/electrical'
    },
    {
      icon: Leaf,
      title: 'Gardening',
      description: 'Garden maintenance & design',
      link: '/services/gardening'
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <ServiceHero
          title="Find Trusted Service Providers"
          subtitle="Connect with verified professionals for all your needs"
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Categories */}
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

          {/* Filters */}
          <Filters
            groups={filterGroups}
            selectedFilters={filters}
            onFilterChange={(groupId, value) => {
              setFilters(prev => ({ ...prev, [groupId]: value }))
            }}
            className="mb-8"
          />

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Card
                key={service.id}
                {...service}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}