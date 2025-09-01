import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StripeVerification from '@/components/verification/stripe-verification'
import { Plus, Building, Wrench, Calendar, User, TrendingUp, Star, Eye } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      listings: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          listings: true
        }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const propertyListings = user.listings.filter(l => l.category === 'PROPERTY')
  const serviceListings = user.listings.filter(l => l.category === 'SERVICE')
  const leisureListings = user.listings.filter(l => l.category === 'LEISURE')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <h1 className="text-2xl font-bold">Greia</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome back, {user.name}</span>
            <Link href="/browse">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/create-listing">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome to Greia</h2>
              <p className="text-blue-100 mb-6">
                Your unified marketplace for properties, services, and experiences across Ireland.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create-listing">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{propertyListings.length}</p>
                      <p className="text-sm text-gray-600">Properties</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+12% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{serviceListings.length}</p>
                      <p className="text-sm text-gray-600">Services</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    <span>4.8 avg rating</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{leisureListings.length}</p>
                      <p className="text-sm text-gray-600">Experiences</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>1.2K views</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user._count.listings}</p>
                      <p className="text-sm text-gray-600">Total Listings</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <span>All categories</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Listings */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Recent Listings</span>
                  <Link href="/browse">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.listings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-6">Start by creating your first listing on Greia</p>
                    <Link href="/create-listing">
                      <Button size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Listing
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.listings.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            listing.category === 'PROPERTY' ? 'bg-blue-100' :
                            listing.category === 'SERVICE' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {listing.category === 'PROPERTY' ? <Building className="h-5 w-5 text-blue-600" /> :
                             listing.category === 'SERVICE' ? <Wrench className="h-5 w-5 text-green-600" /> :
                             <Calendar className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{listing.title}</h4>
                            <p className="text-sm text-gray-600">
                              {listing.category} • {listing.location}, {listing.county}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created {new Date(listing.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {listing.price && (
                            <p className="font-semibold text-lg">€{listing.price.toLocaleString()}</p>
                          )}
                          <p className={`text-sm px-2 py-1 rounded-full ${
                            listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification Status */}
            <StripeVerification
              user={{
                passportVerified: user.passportVerified,
                stripeIdentityVerified: user.stripeIdentityVerified,
                isLicensedAgent: user.isLicensedAgent
              }}
            />

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/create-listing">
                  <Button className="w-full justify-start" size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Listing
                  </Button>
                </Link>
                <Link href="/browse?category=PROPERTY">
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/browse?category=SERVICE">
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="h-4 w-4 mr-2" />
                    Find Services
                  </Button>
                </Link>
                <Link href="/browse?category=LEISURE">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Discover Experiences
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Listing Views</span>
                  <span className="font-semibold">5,678</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inquiries</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-green-600">94%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
