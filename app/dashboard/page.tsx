'use client'

import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Wrench,
  Car,
  Users,
  ArrowRight,
  Star,
  MessageSquare,
  Calendar,
  TrendingUp,
  Eye,
  Heart,
  Bell
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // Example data
  const stats = [
    {
      name: 'Total Views',
      value: '2,345',
      change: '+12.3%',
      trend: 'up',
      icon: Eye
    },
    {
      name: 'Active Listings',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Building2
    },
    {
      name: 'Messages',
      value: '48',
      change: '6 unread',
      trend: 'neutral',
      icon: MessageSquare
    },
    {
      name: 'Saved Items',
      value: '156',
      change: '+3 new',
      trend: 'up',
      icon: Heart
    }
  ]

  const activities = [
    {
      type: 'property',
      title: 'Modern City Apartment',
      action: 'Viewing Request',
      time: '2 hours ago',
      icon: Building2
    },
    {
      type: 'service',
      title: 'Plumbing Service',
      action: 'New Review',
      time: '4 hours ago',
      icon: Wrench
    },
    {
      type: 'leisure',
      title: 'Ferrari 488 GTB',
      action: 'Booking Confirmed',
      time: 'Yesterday',
      icon: Car
    }
  ]

  const upcomingEvents = [
    {
      title: 'Property Viewing',
      location: '123 City Road, London',
      date: 'Today, 2:00 PM',
      type: 'property'
    },
    {
      title: 'Plumber Appointment',
      location: '456 Park Avenue, London',
      date: 'Tomorrow, 10:00 AM',
      type: 'service'
    },
    {
      title: 'Car Rental Pickup',
      location: 'Luxury Car Rentals, London',
      date: 'Sep 21, 9:00 AM',
      type: 'leisure'
    }
  ]

  const recommendations = [
    {
      type: 'property',
      title: 'Luxury Penthouse',
      subtitle: 'Based on your search history',
      image: 'https://placehold.co/600x400',
      icon: Building2
    },
    {
      type: 'service',
      title: 'Interior Designer',
      subtitle: 'Highly rated in your area',
      image: 'https://placehold.co/600x400',
      icon: Wrench
    },
    {
      type: 'leisure',
      title: 'Yacht Charter',
      subtitle: 'Popular this weekend',
      image: 'https://placehold.co/600x400',
      icon: Car
    }
  ]

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, John</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your GREIA account
            </p>
          </div>
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
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
                  <div className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.name}</div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.action}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Upcoming Events</h2>
              <Button variant="ghost" size="sm">
                View Calendar
                <Calendar className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-accent/50 rounded-lg p-4"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.location}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {event.date}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recommended for You</h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="bg-card rounded-lg overflow-hidden group"
                >
                  <div className="relative h-48">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-4 left-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-medium mb-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.subtitle}
                    </div>
                    <Button className="w-full mt-4">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <Building2 className="h-6 w-6 mb-2" />
            <span className="font-medium">List a Property</span>
            <span className="text-sm text-muted-foreground mt-1">
              Create a new property listing
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <Wrench className="h-6 w-6 mb-2" />
            <span className="font-medium">Offer Services</span>
            <span className="text-sm text-muted-foreground mt-1">
              Add your professional services
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <Car className="h-6 w-6 mb-2" />
            <span className="font-medium">List Activity</span>
            <span className="text-sm text-muted-foreground mt-1">
              Share your leisure offerings
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <Users className="h-6 w-6 mb-2" />
            <span className="font-medium">Grow Network</span>
            <span className="text-sm text-muted-foreground mt-1">
              Connect with professionals
            </span>
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}