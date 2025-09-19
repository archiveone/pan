'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import {
  Car,
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
  Users,
  ArrowRight,
  DollarSign,
  Tag
} from 'lucide-react'
import { z } from 'zod'

const bookingSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  guests: z.string().min(1, 'Please select number of guests'),
  notes: z.string().optional()
})

export default function LeisureActivityPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  // Example activity data
  const activity = {
    id: params.id,
    title: 'Ferrari 488 GTB Rental',
    type: 'Car Rental',
    rating: 4.9,
    reviews: 124,
    location: 'London, UK',
    description: 'Experience the thrill of driving a Ferrari 488 GTB. This stunning supercar offers incredible performance and luxury.',
    price: {
      amount: 499,
      unit: 'day',
      currency: '£'
    },
    images: [
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800',
      'https://placehold.co/1200x800'
    ],
    features: [
      'Twin-Turbo V8 Engine',
      '0-60 mph in 3.0 seconds',
      'Automatic Transmission',
      'Premium Sound System',
      'GPS Navigation',
      'Full Insurance Included'
    ],
    requirements: [
      'Valid Driver\'s License',
      'Minimum Age: 25',
      'Clean Driving Record',
      'Security Deposit Required'
    ],
    provider: {
      name: 'Luxury Car Rentals',
      image: 'https://placehold.co/100',
      rating: 4.8,
      reviews: 356
    },
    reviews: [
      {
        name: 'James Wilson',
        rating: 5,
        comment: 'Amazing experience! The car was in perfect condition.',
        date: '3 days ago'
      },
      {
        name: 'Emma Thompson',
        rating: 5,
        comment: 'Professional service and incredible car.',
        date: '1 week ago'
      }
    ],
    availability: {
      status: 'Available',
      nextAvailable: 'Today'
    }
  }

  const bookingFields = [
    {
      name: 'date',
      label: 'Rental Date',
      type: 'date',
      validation: {
        required: 'Please select a date'
      }
    },
    {
      name: 'time',
      label: 'Pickup Time',
      type: 'select',
      options: [
        { value: '09:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '14:00', label: '2:00 PM' }
      ],
      validation: {
        required: 'Please select a time'
      }
    },
    {
      name: 'guests',
      label: 'Duration',
      type: 'select',
      options: [
        { value: '1', label: '1 Day' },
        { value: '2', label: '2 Days' },
        { value: '3', label: '3 Days' },
        { value: '7', label: '1 Week' }
      ],
      validation: {
        required: 'Please select duration'
      }
    },
    {
      name: 'notes',
      label: 'Special Requests',
      type: 'textarea',
      placeholder: 'Any specific requirements or questions'
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
        {/* Image Gallery */}
        <div className="relative h-[600px] bg-accent">
          <img
            src={activity.images[activeImage]}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5" />
                    <span className="text-sm font-medium">{activity.type}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span>{activity.rating}</span>
                      <span className="ml-1">({activity.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-1" />
                      {activity.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-2">
                    {activity.price.currency}{activity.price.amount}
                    <span className="text-lg font-normal">/{activity.price.unit}</span>
                  </div>
                  <div className="text-sm">
                    {activity.availability.status} - {activity.availability.nextAvailable}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Thumbnail Navigation */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {activity.images.map((_, index) => (
              <button
                key={index}
                className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${
                  index === activeImage ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={activity.images[index]}
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
            {/* Details */}
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
                  <TabsTrigger value="reviews" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">About this {activity.type}</h2>
                    <p className="text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activity.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-card rounded-lg p-4"
                        >
                          <Check className="h-5 w-5 text-primary mr-3" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="bg-card rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={activity.provider.image}
                          alt={activity.provider.name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="font-semibold">{activity.provider.name}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {activity.provider.rating} ({activity.provider.reviews} reviews)
                          </div>
                        </div>
                      </div>
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activity.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-card rounded-lg p-4"
                      >
                        <Check className="h-5 w-5 text-primary mr-3" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  {/* Rating Summary */}
                  <div className="bg-card rounded-lg p-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{activity.rating}</div>
                        <div className="flex items-center justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(activity.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {activity.reviews} reviews
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review List */}
                  {activity.reviews.map((review, index) => (
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
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="photos">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activity.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`${activity.title} ${index + 1}`}
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
                <h3 className="text-lg font-semibold mb-4">Book Now</h3>
                <Form
                  fields={bookingFields}
                  onSubmit={handleBooking}
                  schema={bookingSchema}
                  submitText={loading ? 'Processing...' : 'Book Now'}
                  loading={loading}
                  error={error}
                />
              </div>

              {/* Price Breakdown */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Price Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate</span>
                    <span className="font-medium">£499</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">£49</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>£548</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Activities */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Similar Activities</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-lg overflow-hidden"
                    >
                      <img
                        src="https://placehold.co/600x400"
                        alt="Similar Activity"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="font-medium mb-1">Luxury Car Rental</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          London, UK
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">£399/day</div>
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