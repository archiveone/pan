'use client'

import { ConnectHero } from '@/components/ui/hero'
import { Filters } from '@/components/ui/filters'
import { Card } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import {
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  Network,
  MessageCircle,
  Calendar,
  Star,
  MapPin,
  UserCheck,
  MessageSquare,
  Link
} from 'lucide-react'
import { useState } from 'react'

export default function ConnectPage() {
  const [filters, setFilters] = useState({})

  const filterGroups = [
    {
      id: 'category',
      name: 'Category',
      type: 'button',
      options: [
        { id: 'all', name: 'All' },
        { id: 'professionals', name: 'Professionals' },
        { id: 'companies', name: 'Companies' },
        { id: 'groups', name: 'Groups' }
      ]
    },
    {
      id: 'industry',
      name: 'Industry',
      type: 'select',
      options: [
        { id: 'all', name: 'All Industries' },
        { id: 'real-estate', name: 'Real Estate' },
        { id: 'construction', name: 'Construction' },
        { id: 'finance', name: 'Finance' }
      ]
    },
    {
      id: 'location',
      name: 'Location',
      type: 'select',
      options: [
        { id: 'all', name: 'All Locations' },
        { id: 'london', name: 'London' },
        { id: 'manchester', name: 'Manchester' },
        { id: 'birmingham', name: 'Birmingham' }
      ]
    }
  ]

  const categories = [
    {
      icon: Users,
      title: 'Professionals',
      description: 'Connect with experts',
      link: '/connect/professionals'
    },
    {
      icon: Building2,
      title: 'Companies',
      description: 'Business network',
      link: '/connect/companies'
    },
    {
      icon: Network,
      title: 'Groups',
      description: 'Join communities',
      link: '/connect/groups'
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Networking events',
      link: '/connect/events'
    },
    {
      icon: MessageCircle,
      title: 'Forums',
      description: 'Discuss & share',
      link: '/connect/forums'
    }
  ]

  // Example profiles data
  const profiles = [
    {
      id: 1,
      title: 'John Smith',
      subtitle: 'Property Developer',
      description: 'Experienced real estate professional with 15+ years in the industry',
      image: 'https://placehold.co/600x400',
      badges: {
        verified: true,
        featured: true,
        status: 'premium'
      },
      stats: [
        { icon: Star, label: 'Rating', value: '4.9' },
        { icon: UserCheck, label: 'Connections', value: '500+' }
      ],
      actions: [
        { label: 'Connect', href: '/connect/profile/1', primary: true },
        { label: 'Message', onClick: () => {}, icon: MessageSquare }
      ]
    },
    // Add more profiles...
  ]

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <ConnectHero
          title="Build Your Professional Network"
          subtitle="Connect with industry professionals and grow your network"
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

          {/* Featured Groups */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg p-6 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">Group Name</h3>
                      <p className="text-sm text-muted-foreground">1,234 members</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Group description and focus area
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>London</span>
                    <Link className="h-4 w-4 ml-2 mr-1" />
                    <a href="#" className="text-primary hover:underline">Join Group</a>
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

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => (
              <Card
                key={profile.id}
                {...profile}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}