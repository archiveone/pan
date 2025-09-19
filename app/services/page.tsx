'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Briefcase,
  Wrench,
  UserCheck,
  Star,
  Clock,
  ArrowRight,
  Filter,
  MessageSquare,
  Calendar,
  Shield
} from 'lucide-react'

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAvailability, setSelectedAvailability] = useState('all')

  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: Briefcase },
    { id: 'trades', name: 'Trades', icon: Wrench },
    { id: 'professional', name: 'Professional', icon: UserCheck },
    { id: 'specialist', name: 'Specialist', icon: Star },
  ]

  const availabilityOptions = [
    { id: 'all', name: 'Any Time' },
    { id: 'today', name: 'Today' },
    { id: 'this-week', name: 'This Week' },
    { id: 'next-week', name: 'Next Week' },
  ]

  const featuredServices = [
    {
      id: 1,
      title: 'Expert Plumbing Services',
      category: 'trades',
      provider: 'John Smith',
      rating: 4.9,
      reviews: 127,
      location: 'Manchester',
      hourlyRate: 45,
      image: '/images/services/plumbing.jpg',
      verified: true,
      availability: 'Today',
    },
    {
      id: 2,
      title: 'Property Law Consultant',
      category: 'professional',
      provider: 'Sarah Williams',
      rating: 5.0,
      reviews: 89,
      location: 'Liverpool',
      hourlyRate: 150,
      image: '/images/services/legal.jpg',
      verified: true,
      availability: 'Tomorrow',
    },
    {
      id: 3,
      title: 'Interior Design Specialist',
      category: 'specialist',
      provider: 'Emma Brown',
      rating: 4.8,
      reviews: 94,
      location: 'Leeds',
      hourlyRate: 85,
      image: '/images/services/interior-design.jpg',
      verified: true,
      availability: 'This Week',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="greia-hero h-[400px]">
        <div className="greia-hero-image">
          <img
            src="/images/services-hero.jpg"
            alt="Services"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="greia-hero-overlay" />
        <div className="greia-container relative z-10">
          <div className="greia-hero-content text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Find Trusted Service Providers
            </h1>
            <p className="mt-4 text-xl text-gray-200">
              Connect with verified professionals for all your needs
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex items-center bg-white rounded-lg shadow-lg p-2">
                <div className="flex-1 min-w-0 px-4 py-2">
                  <input
                    type="text"
                    className="w-full border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-lg"
                    placeholder="Search for services or providers"
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
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white'
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
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="greia-select"
            >
              {availabilityOptions.map((option) => (
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

        {/* Featured Services */}
        <section className="mb-12">
          <h2 className="greia-heading-2 mb-6">Top Rated Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div key={service.id} className="greia-card group">
                {/* Service Provider Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {service.verified && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-white px-3 py-1 rounded-full flex items-center shadow-md">
                        <Shield className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-600">Verified</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.location}
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-gray-500 ml-1">({service.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    by {service.provider}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    £{service.hourlyRate}/hr
                  </p>

                  {/* Service Features */}
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.availability}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button className="greia-button-secondary flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </button>
                    <button className="greia-button-primary flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-green-600 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Are You a Service Provider?
            </h2>
            <p className="text-green-100 text-lg mb-8">
              Join our network of trusted professionals and grow your business
            </p>
            <Link href="/services/register" className="greia-button-secondary">
              Join as Provider
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}