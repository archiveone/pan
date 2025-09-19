'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Wrench,
  Car,
  Clock,
  MapPin,
  Users,
  Filter,
  MoreVertical,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function CalendarDashboardPage() {
  const [selectedView, setSelectedView] = useState('month')
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Example calendar data
  const events = {
    upcoming: [
      {
        id: 1,
        title: 'Property Viewing',
        type: 'property',
        location: '123 Park Avenue, London',
        date: 'Today, 2:00 PM',
        duration: '1 hour',
        attendees: 3,
        status: 'Confirmed',
        icon: Building2
      },
      {
        id: 2,
        title: 'Plumbing Service',
        type: 'service',
        location: '456 Oxford Street, London',
        date: 'Tomorrow, 10:00 AM',
        duration: '2 hours',
        attendees: 2,
        status: 'Pending',
        icon: Wrench
      },
      {
        id: 3,
        title: 'Car Rental Pickup',
        type: 'leisure',
        location: 'Luxury Car Rentals, London',
        date: 'Sep 21, 9:00 AM',
        duration: '30 minutes',
        attendees: 1,
        status: 'Confirmed',
        icon: Car
      }
    ],
    past: [
      {
        id: 4,
        title: 'House Inspection',
        type: 'property',
        location: '789 Victoria Road, London',
        date: 'Yesterday, 3:00 PM',
        duration: '1.5 hours',
        attendees: 4,
        status: 'Completed',
        icon: Building2
      }
    ]
  }

  // Example calendar grid data
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const date = new Date(2025, 8, i + 1) // September 2025
    return {
      date,
      events: i % 7 === 3 ? 2 : i % 5 === 0 ? 1 : 0
    }
  })

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your appointments and bookings
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-card rounded-lg p-6">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">September 2025</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Today</Button>
                <Tabs value={selectedView} onValueChange={setSelectedView}>
                  <TabsList>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {/* Week Days */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-card p-3 text-center text-sm font-medium"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`bg-card min-h-[120px] p-2 ${
                    day.date.getDay() === 0 || day.date.getDay() === 6
                      ? 'bg-accent/50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${
                      day.date.getDate() === 19 ? 'font-bold text-primary' : ''
                    }`}>
                      {day.date.getDate()}
                    </span>
                    {day.events > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {day.events} events
                      </span>
                    )}
                  </div>
                  {day.events > 0 && (
                    <div className="space-y-1">
                      {Array.from({ length: day.events }).map((_, i) => (
                        <div
                          key={i}
                          className="text-xs bg-accent p-1 rounded truncate"
                        >
                          Event {i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            {/* Quick Add */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Quick Add</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Property Viewing
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Service Booking
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Car className="h-4 w-4 mr-2" />
                  Rental Booking
                </Button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Upcoming Events</h3>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-4">
                {events.upcoming.map((event) => {
                  const Icon = event.icon
                  return (
                    <div
                      key={event.id}
                      className="bg-accent/50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {event.date} ({event.duration})
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              {event.attendees} attendee{event.attendees > 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded ${
                              event.status === 'Confirmed'
                                ? 'bg-success/20 text-success'
                                : 'bg-warning/20 text-warning'
                            }`}>
                              {event.status}
                            </span>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Past Events */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Past Events</h3>
              <div className="space-y-4">
                {events.past.map((event) => {
                  const Icon = event.icon
                  return (
                    <div
                      key={event.id}
                      className="bg-accent/50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {event.date} ({event.duration})
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              {event.attendees} attendees
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                              {event.status}
                            </span>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}