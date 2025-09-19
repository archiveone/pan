'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Coffee,
  Car,
  Boat,
  Ticket,
  Calendar,
  Users,
  Star,
  Clock,
  ArrowRight,
  Filter,
  Heart,
  Share2,
  Shield
} from 'lucide-react'

export default function LeisurePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDate, setSelectedDate] = useState('all')

  const leisureCategories = [
    { id: 'all', name: 'All Activities', icon: Coffee },
    { id: 'rentals', name: 'Rentals', icon: Car },
    { id: 'experiences', name: 'Experiences', icon: Ticket },
    { id: 'venues', name: 'Venues', icon: Users },
  ]

  const dateOptions = [
    { id: 'all', name: 'Any Date' },
    { id: 'today', name: 'Today' },
    { id: 'weekend', name: 'This Weekend' },
    { id: 'week', name: 'This Week' },
  ]

  const featuredActivities = [
    {
      id: 1,
      title: 'Luxury Yacht Experience',
      category: 'rentals',
      provider: 'Premium Marine',
      rating: 4.9,
      reviews: 56,
      location: 'Liverpool Marina',
      pricePerDay: 1200,
      image: '/images/leisure/yacht.jpg',
      capacity: 12,
      duration: '8 hours',
      verified: true,
    },
    {
      id: 2,
      title: 'Wine Tasting Tour',
      category: 'experiences',
      provider: 'Wine & Dine Tours',
      rating: 5.0,
      reviews: 124,
      location: 'Manchester',
      pricePerPerson: 85,
      image: '/images/leisure/wine-tasting.jpg',
      capacity: 8,
      duration: '3 hours',
      verified: true,
    },
    {
      id: 3,
      title: 'Private Event Space',
      category: 'venues',
      provider: 'The Grand Hall',
      rating: 4.8,
      reviews: 89,
      location: 'Leeds City Centre',
      pricePerHour: 250,
      image: '/images/leisure/venue.jpg',
      capacity: 150,
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="greia-hero h-[400px]">
        <div className="greia-hero-image">
          <img
            src="/images/leisure-hero.jpg"
            alt="Leisure"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="greia-hero-overlay" />
        <div className="greia-container relative z-10">
          <div className="greia-hero-content text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Discover Amazing Experiences
            </h1>
            <p className="mt-4 text-xl text-gray-200">
              Find and book unique activities, rentals, and venues
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex items-center bg-white rounded-lg shadow-lg p-2">
                <div className="flex-1 min-w-0 px-4 py-2">
                  <input
                    type="text"
                    className="w-full border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-lg"
                    placeholder="Search for activities, rentals, or venues"
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
              {leisureCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategory === category.id
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="greia-select"
            >
              {dateOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <button className="greia-button-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Featured Activities */}
        <section className="mb-12">
          <h2 className="greia-heading-2 mb-6">Featured Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredActivities.map((activity) => (
              <div key={activity.id} className="greia-card group">
                {/* Activity Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.title}
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
                  {activity.verified && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-white px-3 py-1 rounded-full flex items-center shadow-md">
                        <Shield className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-yellow-500">Verified</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {activity.location}
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{activity.rating}</span>
                      <span className="text-gray-500 ml-1">({activity.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    by {activity.provider}
                  </p>
                  <p className="text-2xl font-bold text-yellow-500 mb-4">
                    £{activity.pricePerDay || activity.pricePerPerson || activity.pricePerHour}
                    <span className="text-sm font-normal text-gray-500">
                      {activity.pricePerDay ? '/day' : activity.pricePerPerson ? '/person' : '/hour'}
                    </span>
                  </p>

                  {/* Activity Features */}
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    {activity.capacity && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Up to {activity.capacity}</span>
                      </div>
                    )}
                    {activity.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{activity.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/leisure/${activity.id}`}
                    className="greia-button-primary w-full text-center"
                  >
                    Book Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-yellow-500 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              List Your Experience or Venue
            </h2>
            <p className="text-yellow-100 text-lg mb-8">
              Share your unique offerings with our community
            </p>
            <Link href="/leisure/list" className="greia-button-secondary">
              Start Listing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}