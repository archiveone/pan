import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Wrench, Calendar, MapPin, Star, User, Phone, Mail, ArrowLeft, MessageCircle, Shield } from 'lucide-react'

// Mock data - in real app this would come from database
const mockUsers = {
  'user1': {
    id: 'user1',
    name: 'Dublin Properties Ltd',
    email: 'info@dublinproperties.ie',
    phone: '+353 1 234 5678',
    isLicensedAgent: true,
    joinedDate: '2023-03-15T10:00:00Z',
    location: 'Dublin, Ireland',
    bio: 'Leading property management company in Dublin with over 15 years of experience. We specialize in premium residential rentals and property sales in Dublin city centre and surrounding areas.',
    stats: {
      totalListings: 24,
      activeListings: 12,
      completedDeals: 156,
      rating: 4.8,
      reviews: 89
    },
    listings: [
      {
        id: '1',
        title: 'Modern 3-Bed Apartment in Dublin City Centre',
        category: 'PROPERTY',
        type: 'APARTMENT_RENT',
        price: 2500,
        location: 'Dublin City Centre',
        images: ['/api/placeholder/400/300'],
        status: 'active'
      },
      {
        id: '2',
        title: 'Luxury Villa with Sea Views',
        category: 'PROPERTY',
        type: 'HOUSE_SALE',
        price: 850000,
        location: 'Howth',
        images: ['/api/placeholder/400/300'],
        status: 'active'
      }
    ],
    verifications: ['Licensed Agent', 'Identity Verified', 'Phone Verified']
  }
}

interface PageProps {
  params: { id: string }
}

export default function ProfilePage({ params }: PageProps) {
  const user = mockUsers[params.id as keyof typeof mockUsers]
  
  if (!user) {
    notFound()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROPERTY': return <Building className="h-4 w-4" />
      case 'SERVICE': return <Wrench className="h-4 w-4" />
      case 'LEISURE': return <Calendar className="h-4 w-4" />
      default: return <Building className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number, category: string, type?: string) => {
    if (category === 'PROPERTY') {
      if (type?.includes('RENT')) {
        return `€${price.toLocaleString()}/month`
      }
      if (price >= 1000000) {
        return `€${(price / 1000000).toFixed(1)}M`
      }
      if (price >= 1000) {
        return `€${(price / 1000).toFixed(0)}K`
      }
    }
    return `€${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <h1 className="text-xl font-semibold">greia</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/browse" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-8">
                {/* Profile Picture & Basic Info */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{user.location}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(user.joinedDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Verifications */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Verifications</h3>
                  <div className="space-y-2">
                    {user.verifications.map((verification, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{verification}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.totalListings}</div>
                    <div className="text-xs text-gray-500">Total Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.completedDeals}</div>
                    <div className="text-xs text-gray-500">Completed Deals</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold">{user.stats.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">{user.stats.reviews} reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats.activeListings}</div>
                    <div className="text-xs text-gray-500">Active Listings</div>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full bg-black hover:bg-gray-800">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact {user.isLicensedAgent ? 'Agent' : 'User'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </CardContent>
            </Card>

            {/* Active Listings */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Active Listings ({user.stats.activeListings})</h2>
                  <Link href="/browse">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.listings.map((listing) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
                        <div className="relative">
                          <div className="aspect-video bg-gray-100 overflow-hidden">
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-blue-100 text-blue-600 border-0">
                              {getCategoryIcon(listing.category)}
                              <span className="ml-1 text-xs font-medium">{listing.category}</span>
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-1 text-gray-600 mb-2">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{listing.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-black">
                              {formatPrice(listing.price, listing.category, listing.type)}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {listing.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
