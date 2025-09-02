'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// This will be replaced with actual API data fetching
const mockProperty = {
  id: '1',
  title: 'Modern 3-Bedroom House',
  description: `A stunning modern house featuring open-plan living, high-end finishes, and a private garden. 
  Recently renovated with new kitchen appliances and smart home technology.
  
  Key Features:
  - Open plan kitchen/living area
  - Master bedroom with en-suite
  - Private garden
  - Smart home features
  - Double garage
  - Close to transport links`,
  price: 450000,
  currency: 'GBP',
  location: 'London, UK',
  bedrooms: 3,
  bathrooms: 2,
  propertyType: 'house',
  listingType: 'sale',
  imageUrl: '/mock/property1.jpg',
  agent: {
    name: 'Sarah Johnson',
    phone: '+44 20 1234 5678',
    email: 'sarah.j@greia.com',
    image: '/mock/agent1.jpg'
  },
  features: [
    'Garden',
    'Parking',
    'Central Heating',
    'Double Glazing'
  ],
  nearbyAmenities: [
    'Schools',
    'Shops',
    'Transport',
    'Parks'
  ]
}

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('details')
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Property Images */}
          <div className="relative w-full h-[400px] mb-6 rounded-lg overflow-hidden">
            <Image
              src={mockProperty.imageUrl}
              alt={mockProperty.title}
              fill
              className="object-cover"
            />
            <Badge 
              className="absolute top-4 right-4"
              variant={mockProperty.listingType === 'sale' ? 'default' : 'secondary'}
            >
              {mockProperty.listingType === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
          </div>

          {/* Property Details Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
              <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <h1 className="text-3xl font-bold mb-4">{mockProperty.title}</h1>
              <p className="text-2xl font-bold text-primary mb-4">
                {mockProperty.currency === 'GBP' ? '£' : mockProperty.currency} 
                {mockProperty.price.toLocaleString()}
                {mockProperty.listingType === 'rent' && '/month'}
              </p>
              <p className="text-lg text-muted-foreground mb-6">{mockProperty.location}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{mockProperty.bedrooms}</p>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{mockProperty.bathrooms}</p>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{mockProperty.propertyType}</p>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{mockProperty.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Property Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockProperty.features.map((feature, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Nearby Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockProperty.nearbyAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Map will be integrated here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={mockProperty.agent.image}
                    alt={mockProperty.agent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{mockProperty.agent.name}</h3>
                  <p className="text-sm text-muted-foreground">Property Agent</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">Call Agent</Button>
                <Button variant="outline" className="w-full">Email Agent</Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground text-center w-full">
                Reference: {mockProperty.id}
              </p>
            </CardFooter>
          </Card>

          {/* Additional Actions */}
          <div className="mt-6 space-y-4">
            <Button variant="outline" className="w-full">Save Property</Button>
            <Button variant="outline" className="w-full">Share Property</Button>
            <Button variant="outline" className="w-full">Report Listing</Button>
          </div>
        </div>
      </div>
    </div>
  )
}