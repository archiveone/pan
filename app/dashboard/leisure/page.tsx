'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Car,
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
  Ship,
  Plane,
  Music,
  Ticket
} from 'lucide-react'
import Link from 'next/link'

export default function LeisureDashboardPage() {
  const [selectedTab, setSelectedTab] = useState('active')

  // Example leisure activities data
  const activities = {
    active: [
      {
        id: 1,
        title: 'Ferrari 488 GTB',
        category: 'Car Rental',
        location: 'London, EC1V',
        price: '£499/day',
        status: 'Available',
        image: 'https://placehold.co/600x400',
        stats: {
          bookings: 28,
          reviews: 22,
          rating: 4.9
        },
        lastUpdated: '2 days ago'
      },
      {
        id: 2,
        title: 'Luxury Yacht Experience',
        category: 'Boat Charter',
        location: 'London, SW1',
        price: '£2,500/day',
        status: 'Booked',
        image: 'https://placehold.co/600x400',
        stats: {
          bookings: 15,
          reviews: 12,
          rating: 4.8
        },
        lastUpdated: '5 days ago'
      }
    ],
    draft: [
      {
        id: 3,
        title: 'Private Jet Charter',
        category: 'Air Travel',
        location: 'London, N1',
        price: '£5,000/trip',
        status: 'Draft',
        image: 'https://placehold.co/600x400',
        lastUpdated: '1 day ago'
      }
    ],
    archived: [
      {
        id: 4,
        title: 'Concert VIP Package',
        category: 'Entertainment',
        location: 'London, E1',
        price: '£250/person',
        status: 'Archived',
        image: 'https://placehold.co/600x400',
        stats: {
          bookings: 156,
          reviews: 89,
          rating: 4.7
        },
        lastUpdated: '2 weeks ago'
      }
    ]
  }

  const stats = [
    {
      name: 'Total Bookings',
      value: '199',
      change: '+23 this month',
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
      value: '£28,560',
      change: '+£3,850 this month',
      icon: DollarSign
    },
    {
      name: 'Active Listings',
      value: '8',
      change: '+2 this week',
      icon: Ticket
    }
  ]

  const categories = [
    { name: 'Cars', icon: Car },
    { name: 'Boats', icon: Ship },
    { name: 'Jets', icon: Plane },
    { name: 'Events', icon: Ticket },
    { name: 'Concerts', icon: Music }
  ]

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leisure Activities</h1>
            <p className="text-muted-foreground">
              Manage your leisure and rental offerings
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
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

        {/* Category Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center"
              >
                <Icon className="h-6 w-6 mb-2" />
                <span>{category.name}</span>
              </Button>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activities..."
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

        {/* Activities List */}
        <div className="bg-card rounded-lg">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full border-b rounded-none p-0">
              <TabsTrigger
                value="active"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Active ({activities.active.length})
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Draft ({activities.draft.length})
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex-1 rounded-none data-[state=active]:bg-accent"
              >
                Archived ({activities.archived.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="p-6">
              <div className="space-y-4">
                {activities.active.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          activity.status === 'Available'
                            ? 'bg-success/20 text-success'
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {activity.category} • {activity.location}
                      </div>
                      <div className="text-lg font-semibold">{activity.price}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {activity.stats.bookings} bookings
                        </span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          {activity.stats.rating} ({activity.stats.reviews} reviews)
                        </span>
                        <span>Updated {activity.lastUpdated}</span>
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
                {activities.draft.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {activity.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {activity.category} • {activity.location}
                      </div>
                      <div className="text-lg font-semibold">{activity.price}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Last edited {activity.lastUpdated}
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
                {activities.archived.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="h-24 w-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {activity.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {activity.category} • {activity.location}
                      </div>
                      <div className="text-lg font-semibold">{activity.price}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{activity.stats.bookings} total bookings</span>
                        <span>{activity.stats.reviews} total reviews</span>
                        <span>Archived {activity.lastUpdated}</span>
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
            <Calendar className="h-6 w-6 mb-2" />
            <span className="font-medium">Manage Calendar</span>
            <span className="text-sm text-muted-foreground mt-1">
              Set availability and bookings
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <DollarSign className="h-6 w-6 mb-2" />
            <span className="font-medium">Update Pricing</span>
            <span className="text-sm text-muted-foreground mt-1">
              Adjust rates and packages
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <MessageSquare className="h-6 w-6 mb-2" />
            <span className="font-medium">View Inquiries</span>
            <span className="text-sm text-muted-foreground mt-1">
              Respond to booking requests
            </span>
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}