'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Users,
  Building,
  UserPlus,
  Briefcase,
  MessageSquare,
  Star,
  Shield,
  ArrowRight,
  Filter,
  Calendar,
  Phone,
  Mail,
  Globe,
  BookOpen
} from 'lucide-react'

export default function ConnectPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('all')

  const networkCategories = [
    { id: 'all', name: 'All Connections', icon: Users },
    { id: 'professionals', name: 'Professionals', icon: Briefcase },
    { id: 'companies', name: 'Companies', icon: Building },
    { id: 'groups', name: 'Groups', icon: UserPlus },
  ]

  const industryOptions = [
    { id: 'all', name: 'All Industries' },
    { id: 'real-estate', name: 'Real Estate' },
    { id: 'construction', name: 'Construction' },
    { id: 'finance', name: 'Finance' },
    { id: 'legal', name: 'Legal' },
  ]

  const featuredConnections = [
    {
      id: 1,
      name: 'Sarah Williams',
      title: 'Property Law Specialist',
      company: 'Williams & Partners',
      industry: 'Legal',
      location: 'Manchester',
      connections: 1247,
      endorsements: 89,
      image: '/images/connect/profile-1.jpg',
      verified: true,
      premium: true,
    },
    {
      id: 2,
      name: 'Manchester Real Estate Network',
      type: 'group',
      members: 3500,
      activity: 'Very Active',
      description: 'Professional network for real estate agents and property developers in Manchester',
      image: '/images/connect/group-1.jpg',
      verified: true,
    },
    {
      id: 3,
      name: 'BuildTech Solutions Ltd',
      type: 'company',
      industry: 'Construction',
      employees: 250,
      location: 'Leeds',
      followers: 1850,
      image: '/images/connect/company-1.jpg',
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="greia-hero h-[400px]">
        <div className="greia-hero-image">
          <img
            src="/images/connect-hero.jpg"
            alt="Connect"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="greia-hero-overlay" />
        <div className="greia-container relative z-10">
          <div className="greia-hero-content text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Connect with Professionals
            </h1>
            <p className="mt-4 text-xl text-gray-200">
              Build your network and grow your business
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex items-center bg-white rounded-lg shadow-lg p-2">
                <div className="flex-1 min-w-0 px-4 py-2">
                  <input
                    type="text"
                    className="w-full border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-lg"
                    placeholder="Search for professionals, companies, or groups"
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
              {networkCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
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
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="greia-select"
            >
              {industryOptions.map((option) => (
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

        {/* Featured Connections */}
        <section className="mb-12">
          <h2 className="greia-heading-2 mb-6">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredConnections.map((connection) => (
              <div key={connection.id} className="greia-card group">
                {/* Profile/Group/Company Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={connection.image}
                    alt={connection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {connection.verified && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-white px-3 py-1 rounded-full flex items-center shadow-md">
                        <Shield className="h-4 w-4 text-purple-600 mr-1" />
                        <span className="text-sm font-medium text-purple-600">Verified</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Connection Details */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {connection.name}
                  </h3>

                  {connection.type === 'group' ? (
                    // Group Details
                    <>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{connection.members.toLocaleString()} members</span>
                        <span className="mx-2">•</span>
                        <span>{connection.activity}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{connection.description}</p>
                    </>
                  ) : connection.type === 'company' ? (
                    // Company Details
                    <>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{connection.industry}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{connection.employees}+ employees</span>
                        <span className="mx-2">•</span>
                        <span>{connection.followers.toLocaleString()} followers</span>
                      </div>
                    </>
                  ) : (
                    // Professional Details
                    <>
                      <p className="text-gray-600 mb-2">{connection.title}</p>
                      <p className="text-gray-600 mb-4">{connection.company}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{connection.connections.toLocaleString()} connections</span>
                        <span className="mx-2">•</span>
                        <Star className="h-4 w-4 mr-1" />
                        <span>{connection.endorsements} endorsements</span>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button className="greia-button-secondary flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </button>
                    <button className="greia-button-primary flex items-center justify-center">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CRM Integration */}
        <section className="bg-purple-600 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Manage Your Network with Built-in CRM
            </h2>
            <p className="text-purple-100 text-lg mb-8">
              Keep track of your connections and grow your business relationships
            </p>
            <Link href="/connect/crm" className="greia-button-secondary">
              Access CRM
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}