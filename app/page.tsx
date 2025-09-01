import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building, Wrench, Calendar, ArrowRight } from 'lucide-react'
import SearchBar from '@/components/search-bar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
      {/* Header */}
      <header className="absolute top-0 w-full z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <h1 className="text-xl font-semibold text-white">greia</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse">
              <Button variant="ghost" className="text-white hover:bg-white/10">Browse</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-white hover:bg-white/10">Sign In</Button>
            </Link>
            <Link href="/create-listing">
              <Button className="bg-white text-blue-600 hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-8xl md:text-9xl font-light text-white mb-4 leading-none">
              my
            </h1>
            <h1 className="text-8xl md:text-9xl font-light text-white mb-4 leading-none">
              home
            </h1>
            <h1 className="text-6xl md:text-7xl font-light text-white/90 leading-none">
              ireland
            </h1>
          </div>
          
          {/* Category Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/browse?category=PROPERTY">
              <Button 
                size="lg" 
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 px-8 py-4 text-lg rounded-full"
              >
                <Building className="mr-2 h-5 w-5" />
                Properties
              </Button>
            </Link>
            <Link href="/browse?category=SERVICE">
              <Button 
                size="lg" 
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 px-8 py-4 text-lg rounded-full"
              >
                <Wrench className="mr-2 h-5 w-5" />
                Services
              </Button>
            </Link>
            <Link href="/browse?category=LEISURE">
              <Button 
                size="lg" 
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 px-8 py-4 text-lg rounded-full"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Experiences
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
              <SearchBar />
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/browse?county=Dublin">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                Dublin
              </Button>
            </Link>
            <Link href="/browse?county=Cork">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                Cork
              </Button>
            </Link>
            <Link href="/browse?county=Galway">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                Galway
              </Button>
            </Link>
            <Link href="/browse?category=PROPERTY&priceRange=0,500000">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                Under €500K
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Everything you need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One platform for all your property, service, and experience needs across Ireland.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Properties */}
            <Link href="/browse?category=PROPERTY">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Building className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Properties</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Houses, apartments, commercial spaces, and short-term rentals across all 32 counties.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Services */}
            <Link href="/browse?category=SERVICE">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <Wrench className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Services</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Contractors, professionals, freelancers, and consultants ready to help with any project.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Experiences */}
            <Link href="/browse?category=LEISURE">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Experiences</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Events, tours, entertainment, and dining experiences from Dublin to Donegal.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to list?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join Ireland's simplest marketplace. Create your account and start listing in minutes.
          </p>
          <Link href="/create-listing">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-full">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">G</span>
                </div>
                <span className="text-xl font-semibold">greia</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your home in Ireland starts here.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Browse</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/browse?category=PROPERTY" className="hover:text-white">Properties</Link></li>
                <li><Link href="/browse?category=SERVICE" className="hover:text-white">Services</Link></li>
                <li><Link href="/browse?category=LEISURE" className="hover:text-white">Experiences</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">Help</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                <li><Link href="#" className="hover:text-white">Safety</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 greia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
