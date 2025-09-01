import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Wrench, Calendar, MapPin, Star, User, Phone, Mail, ArrowLeft, Heart, Share2 } from 'lucide-react'

// Mock data - in real app this would come from database
const mockListings = {
  '1': {
    id: '1',
    title: 'Modern 3-Bed Apartment in Dublin City Centre',
    description: 'Stunning modern apartment with panoramic city views, fully furnished with high-end appliances. Walking distance to Trinity College and Temple Bar. This beautiful apartment features floor-to-ceiling windows, hardwood floors, and a modern kitchen with stainless steel appliances.',
    category: 'PROPERTY',
    type: 'APARTMENT_RENT',
    price: 2500,
    location: 'Dublin City Centre',
    county: 'Dublin',
    images: ['/api/placeholder/800/600', '/api/placeholder/800/600', '/api/placeholder/800/600'],
    features: { bedrooms: 3, bathrooms: 2, area: 120 },
    user: { 
      id: 'user1',
      name: 'Dublin Properties Ltd', 
      isLicensedAgent: true,
      phone: '+353 1 234 5678',
      email: 'info@dublinproperties.ie'
    },
    createdAt: '2025-01-15T10:00:00Z',
    fullDescription: 'This stunning modern apartment offers the perfect blend of luxury and convenience in the heart of Dublin. Located just minutes from Trinity College and Temple Bar, you\'ll be at the center of Dublin\'s vibrant cultural scene.\n\nThe apartment features:\n• 3 spacious bedrooms with built-in wardrobes\n• 2 modern bathrooms with rainfall showers\n• Open-plan living and dining area\n• Fully equipped modern kitchen\n• Private balcony with city views\n• Secure parking space\n• 24/7 concierge service\n\nThe building amenities include a fitness center, rooftop terrace, and secure bike storage. Public transport links are excellent with the Luas and Dublin Bus stops nearby.',
    amenities: ['Parking', 'Balcony', 'Concierge', 'Gym', 'Bike Storage', 'City Views']
  }
}

interface PageProps {
  params: { id: string }
}

export default function ListingDetailPage({ params }: PageProps) {
  const listing = mockListings[params.id as keyof typeof mockListings]
  
  if (!listing) {
    notFound()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROPERTY': return <Building className="h-5 w-5" />
      case 'SERVICE': return <Wrench className="h-5 w-5" />
      case 'LEISURE': return <Calendar className="h-5 w-5" />
      default: return <Building className="h-5 w-5" />
    }
  }

  const formatPrice = (price: number, category: string) => {
    if (category === 'PROPERTY' && listing.type?.includes('RENT')) {
      return `€${price.toLocaleString()}/month`
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
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-4">
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {listing.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Title and Basic Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getCategoryIcon(listing.category)}
                  {listing.category}
                </Badge>
                <Badge variant="outline">{listing.type?.replace('_', ' ')}</Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.location}, {listing.county}
                </div>
                {listing.features && (
                  <>
                    {listing.features.bedrooms && (
                      <span>{listing.features.bedrooms} bed</span>
                    )}
                    {listing.features.bathrooms && (
                      <span>{listing.features.bathrooms} bath</span>
                    )}
                    {listing.features.area && (
                      <span>{listing.features.area}m²</span>
                    )}
                  </>
                )}
              </div>

              <div className="text-3xl font-bold text-black mb-6">
                {formatPrice(listing.price, listing.category)}
              </div>
            </div>

            {/* Description */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <div className="prose prose-gray max-w-none">
                  {listing.fullDescription?.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {listing.amenities && (
              <Card className="mb-8">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <Link href={`/profile/${listing.user.id}`}><h3 className="font-semibold hover:text-blue-600 transition-colors cursor-pointer">{listing.user.name}</h3></Link>
                    {listing.user.isLicensedAgent && (
                      <Badge variant="secondary" className="text-xs">Licensed Agent</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{listing.user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{listing.user.email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-black hover:bg-gray-800">
                    Contact {listing.category === 'PROPERTY' ? 'Agent' : 'Provider'}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed</span>
                    <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span>{listing.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span>{listing.county}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
