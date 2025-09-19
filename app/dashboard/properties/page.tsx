'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Plus,
  Search,
  Eye,
  MessageSquare,
  Star,
  Edit,
  Trash2,
  ArrowUpDown,
  Filter,
  Download,
  Share2
} from 'lucide-react'
import Link from 'next/link'

export default function PropertiesDashboardPage() {
  const [selectedTab, setSelectedTab] = useState('active')

  // Example property listings data
  const properties = {
    active: [
      {
        id: 1,
        title: 'Modern City Apartment',
        type: 'Apartment',
        location: 'London, EC1V',
        price: '£450,000',
        status: 'For Sale',
        image: 'https://placehold.co/600x400',
        stats: {
          views: 245,
          inquiries: 12,
          saves: 34
        },
        lastUpdated: '2 days ago'
      },
      {
        id: 2,
        title: 'Luxury Penthouse',
        type: 'Penthouse',
        location: 'London, SW1',
        price: '£2,500/month',
        status: 'For Rent',
        image: 'https://placehold.co/600x400',
        stats: {
          views: 189,
          inquiries: 8,
          saves: 27
        },
        lastUpdated: '5 days ago'
      }
    ],
    draft: [
      {
        id: 3,
        title: 'Family Home',
        type: 'House',
        location: 'London, N1',
        price: '£750,000',
        status: 'Draft',
        image: 'https://placehold.co/600x400',
        lastUpdated: '1 day ago'
      }
    ],
    archived: [
      {
        id: 4,
        title: 'Studio Apartment',
        type: 'Studio',
        location: 'London, E1',
        price: '£1,200/month',
        status: 'Archived',
        image: 'https://placehold.co/600x400',
        stats: {
          views: 156,
          inquiries: 5,
          saves: 18
        },
        lastUpdated: '2 weeks ago'
      }
    ]
  }

  const stats = [
    {
      name: 'Total Listings',
      value: '12',
      change: '+2 this month',
      icon: Building2
    },
    {
      name: 'Total Views',
      value: '2,345',
      change: '+12.3% this week',
      icon: Eye
    },
    {
      name: 'Total Inquiries',
      value: '48',
      change: '6 new',
      icon: MessageSquare
    },
    {
      name: 'Average Rating',
      value: '4.8',
      change: '+0.2 this month',
      icon: Star
    }
  ]

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Properties</h1>
            <p className="text-muted-foreground">
              Manage your property listings
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-card rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm text-success">
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.name}</div>
              </div>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-md"
            />
          </div>
          <Button variant="outline">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Properties List */}
        <div className="bg-card rounded-lg">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full border-b rounded-none p-0">
              <TabsTrigger
                value="active"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Active ({properties.active.length})
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Draft ({properties.draft.length})
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex-1 rounded-none data-[state=active]:bg-accent"
              >
                Archived ({properties.archived.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="p-6">
              <div className="space-y-4">
                {properties.active.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{property.title}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {property.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {property.type} • {property.location}
                      </div>
                      <div className="text-lg font-semibold">{property.price}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{property.stats.views} views</span>
                        <span>{property.stats.inquiries} inquiries</span>
                        <span>{property.stats.saves} saves</span>
                        <span>Updated {property.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="draft" className="p-6">
              <div className="space-y-4">
                {properties.draft.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{property.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {property.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {property.type} • {property.location}
                      </div>
                      <div className="text-lg font-semibold">{property.price}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Last edited {property.lastUpdated}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button>
                        Complete Listing
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="archived" className="p-6">
              <div className="space-y-4">
                {properties.archived.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{property.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {property.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {property.type} • {property.location}
                      </div>
                      <div className="text-lg font-semibold">{property.price}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{property.stats.views} total views</span>
                        <span>{property.stats.inquiries} total inquiries</span>
                        <span>Archived {property.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        Restore
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  )
}