'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import {
  Wrench,
  Star,
  Clock,
  MapPin,
  Calendar,
  Heart,
  Share,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Info,
  Check,
  Shield,
  Award,
  ThumbsUp,
  ArrowRight
} from 'lucide-react'
import { z } from 'zod'

const bookingSchema = z.object({
  service: z.string().min(1, 'Please select a service'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional()
})

export default function ServiceProviderPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Example service provider data
  const provider = {
    id: params.id,
    name: 'John Smith',
    title: 'Professional Plumber',
    rating: 4.9,
    reviews: 156,
    verified: true,
    location: 'London, UK',
    description: 'Expert plumbing services with over 15 years of experience. Specializing in residential and commercial plumbing solutions.',
    hourlyRate: '£60',
    availability: 'Available Today',
    images: [
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800'
    ],
    services: [
      {
        name: 'Emergency Plumbing',
        price: '£80/hour',
        description: '24/7 emergency plumbing services'
      },
      {
        name: 'Installation',
        price: '£60/hour',
        description: 'Installation of fixtures and appliances'
      },
      {
        name: 'Maintenance',
        price: '£50/hour',
        description: 'Regular maintenance and inspections'
      }
    ],
    certifications: [
      'City & Guilds Level 3',
      'Gas Safe Registered',
      'Public Liability Insurance'
    ],
    reviews: [
      {
        name: 'Sarah Johnson',
        rating: 5,
        comment: 'Excellent service, very professional and efficient.',
        date: '2 days ago'
      },
      {
        name: 'Mike Brown',
        rating: 5,
        comment: 'Great work, fixed the issue quickly.',
        date: '1 week ago'
      }
    ]
  }

  const bookingFields = [
    {
      name: 'service',
      label: 'Service Type',
      type: 'select',
      options: provider.services.map(service => ({
        value: service.name,
        label: `${service.name} - ${service.price}`
      })),
      validation: {
        required: 'Please select a service'
      }
    },
    {
      name: 'date',
      label: 'Preferred Date',
      type: 'date',
      validation: {
        required: 'Please select a date'
      }
    },
    {
      name: 'time',
      label: 'Preferred Time',
      type: 'select',
      options: [
        { value: '09:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' }
      ],
      validation: {
        required: 'Please select a time'
      }
    },
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      placeholder: 'Any specific requirements or details'
    }
  ]

  const handleBooking = async (data: z.infer<typeof bookingSchema>) => {
    setLoading(true)
    setError('')

    try {
      // Handle booking submission
      console.log('Booking:', data)
    } catch (err) {
      setError('Failed to submit booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-12">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Wrench className="h-12 w-12" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{provider.name}</h1>
                  {provider.verified && (
                    <div className="flex items-center text-sm bg-success/20 text-success px-2 py-1 rounded">
                      <Shield className="h-4 w-4 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-xl mb-4">{provider.title}</p>
                <div className="flex items-center gap-6 text-primary-foreground/80">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span>{provider.rating}</span>
                    <span className="ml-1">({provider.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    {provider.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-1" />
                    {provider.availability}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold mb-2">
                  {provider.hourlyRate}
                  <span className="text-lg font-normal">/hour</span>
                </div>
                <Button className="mr-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Services
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Gallery
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">About</h2>
                    <p className="text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {provider.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-card rounded-lg p-4"
                        >
                          <Award className="h-6 w-6 text-primary mr-3" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="space-y-6">
                  {provider.services.map((service, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">{service.name}</h3>
                        <div className="text-xl font-bold">{service.price}</div>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <Button>Book This Service</Button>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  {/* Rating Summary */}
                  <div className="bg-card rounded-lg p-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{provider.rating}</div>
                        <div className="flex items-center justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(provider.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {provider.reviews} reviews
                        </div>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map(rating => (
                          <div key={rating} className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground w-8">
                              {rating} ★
                            </div>
                            <div className="flex-1 h-2 bg-accent rounded-full">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{
                                  width: rating === 5 ? '80%' : rating === 4 ? '15%' : '5%'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Review List */}
                  {provider.reviews.map((review, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold">{review.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.date}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Helpful
                        </Button>
                        <Button variant="ghost" size="sm">
                          Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="gallery">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {provider.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Work ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
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

              {/* Booking Form */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Book a Service</h3>
                <Form
                  fields={bookingFields}
                  onSubmit={handleBooking}
                  schema={bookingSchema}
                  submitText={loading ? 'Booking...' : 'Book Now'}
                  loading={loading}
                  error={error}
                />
              </div>

              {/* Business Hours */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
                <div className="space-y-2">
                  {[
                    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
                    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
                    { day: 'Sunday', hours: 'Closed' }
                  ].map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{schedule.day}</span>
                      <span className="font-medium">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Providers */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Similar Providers</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-lg p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Professional Plumber</div>
                          <div className="text-sm text-muted-foreground">London</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
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