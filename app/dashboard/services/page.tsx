'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Wrench,
  Plus,
  Search,
  Star,
  MessageSquare,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  ArrowUpDown,
  Filter,
  Download,
  Share2,
  Clock,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

export default function ServicesDashboardPage() {
  const [selectedTab, setSelectedTab] = useState('active')

  // Example services data
  const services = {
    active: [
      {
        id: 1,
        title: 'Plumbing Services',
        category: 'Home Maintenance',
        location: 'London, EC1V',
        rate: '£60/hour',
        status: 'Available',
        image: 'https://placehold.co/600x400',
        stats: {
          bookings: 45,
          reviews: 32,
          rating: 4.8
        },
        lastUpdated: '2 days ago'
      },
      {
        id: 2,
        title: 'Interior Design',
        category: 'Design',
        location: 'London, SW1',
        rate: '£80/hour',
        status: 'Busy',
        image: 'https://placehold.co/600x400',
        stats: {
          bookings: 28,
          reviews: 24,
          rating: 4.9
        },
        lastUpdated: '5 days ago'
      }
    ],
    draft: [
      {
        id: 3,
        title: 'Gardening Services',
        category: 'Outdoor',
        location: 'London, N1',
        rate: '£45/hour',
        status: 'Draft',
        image: 'https://placehold.co/600x400',
        lastUpdated: '1 day ago'
      }
    ],
    archived: [
      {
        id: 4,
        title: 'Painting Services',
        category: 'Home Improvement',
        location: 'London, E1',
        rate: '£50/hour',
        status: 'Archived',
        image: 'https://placehold.co/600x400',
        stats: {
          bookings: 56,
          reviews: 42,
          rating: 4.7
        },
        lastUpdated: '2 weeks ago'
      }
    ]
  }

  const stats = [
    {
      name: 'Total Bookings',
      value: '129',
      change: '+15 this month',
      icon: Calendar
    },
    {
      name: 'Average Rating',
      value: '4.8',
      change: '+0.2 this week',
      icon: Star
    },
    {
      name: 'Total Revenue',
      value: '£4,560',
      change: '+£850 this month',
      icon: DollarSign
    },
    {
      name: 'Response Rate',
      value: '95%',
      change: '+2% this week',
      icon: MessageSquare
    }
  ]

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Services</h1>
            <p className="text-muted-foreground">
              Manage your service offerings
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
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
              placeholder="Search services..."
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

        {/* Services List */}
        <div className="bg-card rounded-lg">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full border-b rounded-none p-0">
              <TabsTrigger
                value="active"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Active ({services.active.length})
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Draft ({services.draft.length})
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex-1 rounded-none data-[state=active]:bg-accent"
              >
                Archived ({services.archived.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="p-6">
              <div className="space-y-4">
                {services.active.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{service.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          service.status === 'Available'
                            ? 'bg-success/20 text-success'
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {service.category} • {service.location}
                      </div>
                      <div className="text-lg font-semibold">{service.rate}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {service.stats.bookings} bookings
                        </span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          {service.stats.rating} ({service.stats.reviews} reviews)
                        </span>
                        <span>Updated {service.lastUpdated}</span>
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
                {services.draft.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{service.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {service.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {service.category} • {service.location}
                      </div>
                      <div className="text-lg font-semibold">{service.rate}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Last edited {service.lastUpdated}
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
                {services.archived.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{service.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {service.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {service.category} • {service.location}
                      </div>
                      <div className="text-lg font-semibold">{service.rate}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{service.stats.bookings} total bookings</span>
                        <span>{service.stats.reviews} total reviews</span>
                        <span>Archived {service.lastUpdated}</span>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <Clock className="h-6 w-6 mb-2" />
            <span className="font-medium">Set Availability</span>
            <span className="text-sm text-muted-foreground mt-1">
              Manage your working hours
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <DollarSign className="h-6 w-6 mb-2" />
            <span className="font-medium">Update Pricing</span>
            <span className="text-sm text-muted-foreground mt-1">
              Adjust your service rates
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <CheckCircle2 className="h-6 w-6 mb-2" />
            <span className="font-medium">Verify Profile</span>
            <span className="text-sm text-muted-foreground mt-1">
              Complete verification process
            </span>
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}