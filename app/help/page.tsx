import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, MessageCircle, Book, Shield, CreditCard, Home, Users, Phone } from 'lucide-react'

export default function HelpPage() {
  const helpCategories = [
    {
      icon: <Home className="h-6 w-6" />,
      title: "Getting Started",
      description: "Learn the basics of using Greia",
      articles: [
        "How to create your first listing",
        "Setting up your profile",
        "Understanding verification",
        "Platform overview"
      ]
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "For Property Owners",
      description: "Maximize your property listings",
      articles: [
        "Creating effective property listings",
        "Pricing your property",
        "Managing inquiries",
        "Licensed agent verification"
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safety & Trust",
      description: "Stay safe on our platform",
      articles: [
        "Identity verification process",
        "Reporting suspicious activity",
        "Payment protection",
        "Meeting safely"
      ]
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Billing & Payments",
      description: "Manage your account and payments",
      articles: [
        "Understanding pricing plans",
        "Payment methods",
        "Refund policy",
        "Billing issues"
      ]
    }
  ]

  const popularArticles = [
    "How do I verify my identity?",
    "What makes an agent 'licensed'?",
    "How to contact a property owner",
    "Understanding listing fees",
    "How to report a problem",
    "Cancellation policy"
  ]

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
            <Link href="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions and get the support you need
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search for help articles..."
                className="pl-12 py-4 text-lg border-2 border-gray-200 focus:border-black"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/contact">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600">Get help from our support team</p>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Book className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">User Guide</h3>
                <p className="text-sm text-gray-600">Complete guide to using Greia</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-gray-600">+353 1 800 GREIA</p>
              </CardContent>
            </Card>
          </div>

          {/* Popular Articles */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Popular Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 hover:text-black">{article}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{category.title}</h3>
                      <p className="text-sm text-gray-600 font-normal">{category.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-700 hover:text-black text-sm">{article}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Still Need Help */}
          <Card className="mt-12 bg-gray-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
              <p className="text-gray-600 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-black hover:bg-gray-800">
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline">
                  Schedule a Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
