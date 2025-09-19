'use client'

import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import {
  Home,
  Wrench,
  Car,
  Users,
  Shield,
  Globe,
  Star,
  ArrowRight,
  Building2,
  MessageSquare,
  Calendar,
  Search
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      icon: Home,
      title: 'Properties',
      description: 'Find your perfect property to buy, rent, or sell',
      link: '/properties'
    },
    {
      icon: Wrench,
      title: 'Services',
      description: 'Connect with trusted service providers',
      link: '/services'
    },
    {
      icon: Car,
      title: 'Leisure',
      description: 'Discover amazing experiences and rentals',
      link: '/leisure'
    },
    {
      icon: Users,
      title: 'Connect',
      description: 'Build your professional network',
      link: '/connect'
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Users',
      description: 'All users are verified through Stripe Identity'
    },
    {
      icon: Globe,
      title: 'All-in-One Platform',
      description: 'Everything you need in one place'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'High standards for all listings and services'
    }
  ]

  const testimonials = [
    {
      name: 'John Smith',
      role: 'Property Developer',
      content: 'GREIA has transformed how I manage my property portfolio and connect with clients.',
      image: 'https://placehold.co/100'
    },
    {
      name: 'Sarah Johnson',
      role: 'Interior Designer',
      content: 'The platform makes it easy to showcase my work and find new opportunities.',
      image: 'https://placehold.co/100'
    },
    {
      name: 'Mike Brown',
      role: 'Homeowner',
      content: 'Found my dream home and all the services I needed to make it perfect.',
      image: 'https://placehold.co/100'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '100,000+' },
    { label: 'Properties Listed', value: '50,000+' },
    { label: 'Service Providers', value: '25,000+' },
    { label: 'Monthly Bookings', value: '10,000+' }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center">
          <div className="absolute inset-0">
            <img
              src="/my-home-worldwide.png"
              alt="GREIA Platform"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Life's Operating System
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Your unified platform for Properties, Services, Leisure, and Connect.
                Everything you need, all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center bg-card rounded-lg shadow-lg p-2">
                <div className="flex-1 min-w-0 px-4 py-2">
                  <input
                    type="text"
                    className="w-full border-0 focus:ring-0 text-foreground placeholder-muted-foreground bg-transparent text-lg"
                    placeholder="Search properties, services, or activities..."
                  />
                </div>
                <Button className="ml-2">
                  <Search className="h-5 w-5" />
                  <span className="ml-2">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-accent">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Link
                    key={index}
                    href={feature.link}
                    className="group bg-card rounded-lg p-6 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-8 w-8 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground group-hover:text-primary-foreground/80">
                      {feature.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose GREIA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="text-center">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-primary-foreground/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div className="ml-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-accent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who trust GREIA for their lifestyle needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6">
                <Building2 className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Property Management</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive tools for managing your property portfolio.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Listing management
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Tenant screening
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Document storage
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-lg p-6">
                <MessageSquare className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Communication Hub</h3>
                <p className="text-muted-foreground mb-4">
                  Stay connected with clients and service providers.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Real-time messaging
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    File sharing
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Video calls
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-lg p-6">
                <Calendar className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Booking System</h3>
                <p className="text-muted-foreground mb-4">
                  Efficient scheduling and booking management.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Calendar integration
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Automated reminders
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-primary mr-2" />
                    Payment processing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}