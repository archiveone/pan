import Link from 'next/link'
import { ArrowRight, Home, Briefcase, Coffee, Users, Star, Shield, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="greia-hero">
        <div className="greia-hero-image">
          <img
            src="/images/my-home-worldwide.jpg"
            alt="GREIA Platform"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="greia-hero-overlay" />
        <div className="greia-container relative z-10">
          <div className="greia-hero-content text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Life's Operating System</span>
              <span className="block text-blue-400">One Platform for Everything</span>
            </h1>
            <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
              Your unified platform for properties, services, leisure activities, and professional networking.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                <Link href="/auth/signup" className="greia-button-primary">
                  Get Started
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link href="/browse" className="greia-button-secondary">
                  Browse Platform
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="greia-container">
          <div className="text-center">
            <h2 className="greia-heading-2">Everything You Need in One Place</h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover why thousands of professionals choose GREIA as their platform of choice.
            </p>
          </div>

          <div className="mt-12 greia-feature-grid">
            {/* Properties */}
            <div className="greia-feature-card">
              <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Properties</h3>
              <p className="mt-2 text-base text-gray-500">
                Buy, sell, or rent properties with ease. Connect with verified agents and landlords.
              </p>
            </div>

            {/* Services */}
            <div className="greia-feature-card">
              <div className="h-12 w-12 rounded-md bg-green-500 text-white flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Services</h3>
              <p className="mt-2 text-base text-gray-500">
                Find trusted professionals and service providers for all your needs.
              </p>
            </div>

            {/* Leisure */}
            <div className="greia-feature-card">
              <div className="h-12 w-12 rounded-md bg-yellow-500 text-white flex items-center justify-center mb-4">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Leisure</h3>
              <p className="mt-2 text-base text-gray-500">
                Book experiences, rentals, and activities for work and pleasure.
              </p>
            </div>

            {/* Connect */}
            <div className="greia-feature-card">
              <div className="h-12 w-12 rounded-md bg-purple-500 text-white flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Connect</h3>
              <p className="mt-2 text-base text-gray-500">
                Network with professionals and manage your relationships with built-in CRM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gray-50">
        <div className="greia-container">
          <div className="text-center">
            <h2 className="greia-heading-2">Why Choose GREIA?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the benefits of our comprehensive platform.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Verified Users</h3>
              <p className="mt-2 text-base text-gray-500">
                All users are verified through our secure identity verification system.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Quality Assured</h3>
              <p className="mt-2 text-base text-gray-500">
                High standards maintained through our review and rating system.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Global Network</h3>
              <p className="mt-2 text-base text-gray-500">
                Connect with professionals and opportunities worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600">
        <div className="greia-container py-12 md:py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of professionals already using GREIA.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}