import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Home, Wrench, Calendar, Users, MapPin, Star, ArrowRight, Mail, Phone, Twitter, Facebook, Instagram } from 'lucide-react'
import SearchBar from '@/components/search-bar'

export default function HomePage() {
  const featuredListings = [
    {
      id: '1',
      title: 'Modern 3-Bed Apartment in Dublin City Centre',
      category: 'PROPERTY',
      price: 2500,
      location: 'Dublin, Ireland',
      image: '/api/placeholder/400/300',
      rating: 4.8,
      reviews: 24
    },
    {
      id: '2',
      title: 'Professional Web Development Services',
      category: 'SERVICE',
      price: 75,
      location: 'London, UK',
      image: '/api/placeholder/400/300',
      rating: 4.9,
      reviews: 156
    },
    {
      id: '3',
      title: 'Guided City Walking Tour',
      category: 'LEISURE',
      price: 25,
      location: 'Paris, France',
      image: '/api/placeholder/400/300',
      rating: 4.7,
      reviews: 89
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400">
        {/* Header */}
        <header className="relative z-10">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <Link href="/" className="flex items-center justify-center flex-1">
              <img 
                src="/greia-logo.png" 
                alt="Greia" 
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4 absolute right-4">
              <Link href="/browse">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  Browse
                </Button>
              </Link>
              <Link href="/create-listing">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  + Add Listing
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          {/* Main Logo/Text */}
          <div className="mb-16">
            <img 
              src="/my-home-worldwide.png" 
              alt="My Home Worldwide" 
              className="max-w-2xl w-full h-auto mx-auto mb-8"
            />
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/browse?category=PROPERTY">
              <Button 
                variant="outline" 
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white px-8 py-3 text-lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Properties
              </Button>
            </Link>
            <Link href="/browse?category=SERVICE">
              <Button 
                variant="outline" 
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white px-8 py-3 text-lg"
              >
                <Wrench className="h-5 w-5 mr-2" />
                Services
              </Button>
            </Link>
            <Link href="/browse?category=LEISURE">
              <Button 
                variant="outline" 
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white px-8 py-3 text-lg"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Leisure
              </Button>
            </Link>
            <Link href="/browse">
              <Button 
                variant="outline" 
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white px-8 py-3 text-lg"
              >
                <Users className="h-5 w-5 mr-2" />
                Connect
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-16">
            <SearchBar />
          </div>
        </main>

        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Curved Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="relative block w-full h-full"
          >
            <path 
              d="M0,0 C150,100 350,100 600,50 C850,0 1050,0 1200,50 L1200,120 L0,120 Z" 
              className="fill-white"
            />
          </svg>
        </div>
      </div>

      {/* Featured Listings Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Listings</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the best properties, services, and experiences from around the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredListings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={listing.image} 
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600 text-white border-0">
                        {listing.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{listing.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{listing.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({listing.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-black">
                        €{listing.price.toLocaleString()}
                        {listing.category === 'PROPERTY' && '/month'}
                        {listing.category === 'SERVICE' && '/hour'}
                        {listing.category === 'LEISURE' && '/person'}
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/browse">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                View All Listings
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <img 
                src="/greia-logo.png" 
                alt="Greia" 
                className="h-10 w-auto mb-4 filter brightness-0 invert"
              />
              <p className="text-gray-300 mb-6 max-w-md">
                Your global marketplace for properties, services, and experiences. 
                Connect with trusted providers worldwide.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/browse" className="text-gray-300 hover:text-white transition-colors">Browse Listings</Link></li>
                <li><Link href="/create-listing" className="text-gray-300 hover:text-white transition-colors">Add Listing</Link></li>
                <li><Link href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-gray-300">hello@greia.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Greia. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
