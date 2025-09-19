'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import {
  Home,
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Heart,
  Share,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Info,
  Star,
  ArrowRight,
  Check
} from 'lucide-react'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export default function PropertyPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  // Example property data
  const property = {
    id: params.id,
    title: 'Modern City Apartment',
    price: '£450,000',
    address: '123 City Road, London, EC1V 1NR',
    description: 'A stunning 2-bedroom apartment in the heart of London with amazing city views.',
    features: [
      { icon: Bed, label: 'Bedrooms', value: '2' },
      { icon: Bath, label: 'Bathrooms', value: '2' },
      { icon: Square, label: 'Square Feet', value: '1,200' },
      { icon: Home, label: 'Property Type', value: 'Apartment' }
    ],
    images: [
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800'
    ],
    amenities: [
      'Central Heating',
      'Double Glazing',
      'Fitted Kitchen',
      'Parking',
      'Garden',
      'Security System'
    ],
    agent: {
      name: 'John Smith',
      company: 'GREIA Properties',
      image: 'https://placehold.co/100',
      rating: 4.9,
      reviews: 156
    }
  }

  const contactFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your name',
      validation: {
        required: 'Name is required'
      }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      validation: {
        required: 'Email is required'
      }
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: 'Enter your phone number'
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Enter your message',
      validation: {
        required: 'Message is required'
      }
    }
  ]

  const handleContact = async (data: z.infer<typeof contactSchema>) => {
    setLoading(true)
    setError('')

    try {
      // Handle contact form submission
      console.log('Contact form:', data)
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-12">
        {/* Image Gallery */}
        <div className="relative h-[600px] bg-accent">
          <img
            src={property.images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-white/80">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}
                  </div>
                </div>
                <div className="text-3xl font-bold">{property.price}</div>
              </div>
            </div>
          </div>
          {/* Thumbnail Navigation */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${
                  index === activeImage ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={property.images[index]}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Key Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.features.map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <div
                          key={index}
                          className="bg-card rounded-lg p-4 text-center"
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="text-sm text-muted-foreground">
                            {feature.label}
                          </div>
                          <div className="font-semibold">{feature.value}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-muted-foreground">
                      {property.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-primary mr-2" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features">
                  {/* Additional features content */}
                </TabsContent>

                <TabsContent value="photos">
                  {/* Photo gallery grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  {/* Documents list */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-primary mr-3" />
                        <div>
                          <div className="font-medium">Floor Plan</div>
                          <div className="text-sm text-muted-foreground">PDF, 2.4MB</div>
                        </div>
                      </div>
                      <Button variant="outline">Download</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-primary mr-3" />
                        <div>
                          <div className="font-medium">Energy Certificate</div>
                          <div className="text-sm text-muted-foreground">PDF, 1.8MB</div>
                        </div>
                      </div>
                      <Button variant="outline">Download</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Agent Info */}
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={property.agent.image}
                    alt={property.agent.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="ml-4">
                    <div className="font-semibold">{property.agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.agent.company}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-primary mr-1" />
                    {property.agent.rating}
                  </div>
                  <div>{property.agent.reviews} reviews</div>
                </div>
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Agent
                </Button>
              </div>

              {/* Contact Form */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Request Information</h3>
                <Form
                  fields={contactFields}
                  onSubmit={handleContact}
                  schema={contactSchema}
                  submitText={loading ? 'Sending...' : 'Send Message'}
                  loading={loading}
                  error={error}
                />
              </div>

              {/* Schedule Viewing */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Schedule Viewing</h3>
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Viewing
                </Button>
              </div>

              {/* Similar Properties */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Similar Properties</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-lg overflow-hidden"
                    >
                      <img
                        src="https://placehold.co/600x400"
                        alt="Similar Property"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="font-medium mb-1">Modern Apartment</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          London, EC1V
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">£425,000</div>
                          <Button variant="ghost" size="sm">
                            View
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}