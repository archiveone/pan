'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Info,
  CheckCircle,
  X,
  CreditCard,
  Shield,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Sample leisure item data
const leisureItem = {
  id: 1,
  type: 'event',
  title: 'Summer Music Festival 2025',
  description: `Join us for three days of incredible live music featuring top international artists! Experience:

  • Multiple stages with diverse genres
  • Food and drink villages
  • VIP areas and experiences
  • Art installations
  • Silent disco
  • Camping facilities
  
  Line-up includes international headliners and local talents across various genres including rock, pop, electronic, and indie music.`,
  location: 'Phoenix Park, Dublin',
  dates: {
    start: '2025-07-15',
    end: '2025-07-17',
  },
  times: {
    doors: '12:00 PM',
    end: '11:00 PM',
  },
  pricing: {
    regular: {
      name: 'Regular Ticket',
      price: 45,
      description: 'General admission for one day',
    },
    vip: {
      name: 'VIP Pass',
      price: 120,
      description: 'VIP access with exclusive areas and benefits',
    },
    weekend: {
      name: 'Weekend Pass',
      price: 110,
      description: 'Three-day general admission',
    },
  },
  images: [
    '/images/leisure/festival-1.jpg',
    '/images/leisure/festival-2.jpg',
    '/images/leisure/festival-3.jpg',
  ],
  category: 'Music',
  capacity: 5000,
  remaining: 750,
  rating: 4.8,
  reviews: 245,
  featured: true,
  organizer: {
    name: 'EventPro Ireland',
    image: '/images/organizers/eventpro.jpg',
    verified: true,
    experience: '10+ years',
    events: 150,
  },
  amenities: [
    'Food & Drink',
    'Restrooms',
    'First Aid',
    'Security',
    'ATM',
    'Parking',
  ],
  faqs: [
    {
      question: 'What items are prohibited?',
      answer: 'Glass bottles, outside food/drink, professional cameras, drones, weapons',
    },
    {
      question: 'Is there parking available?',
      answer: 'Yes, paid parking is available on-site. We recommend using public transport.',
    },
    // Add more FAQs...
  ],
  reviews: [
    {
      id: 1,
      user: {
        name: 'John D.',
        image: '/images/users/user-1.jpg',
      },
      rating: 5,
      date: '2024-07-20',
      comment: 'Amazing festival! Great organization and fantastic lineup.',
    },
    // Add more reviews...
  ],
};

export default function LeisureDetailPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [ticketType, setTicketType] = useState('regular');
  const [quantity, setQuantity] = useState(1);
  const [showBooking, setShowBooking] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Calculate total price
  const selectedTicket = leisureItem.pricing[ticketType as keyof typeof leisureItem.pricing];
  const totalPrice = selectedTicket.price * quantity;

  // Handle booking steps
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Handle payment
  const handlePayment = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice * 100, // Convert to cents
          currency: 'eur',
          ticketType,
          quantity,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement('card')!,
          billing_details: {
            name: 'Customer Name', // Add form for this
          },
        },
      });

      if (result.error) {
        console.error(result.error);
        // Handle error
      } else {
        // Payment successful
        // Update booking status
        setCurrentStep(3);
      }
    } catch (error) {
      console.error(error);
      // Handle error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={leisureItem.images[currentImageIndex]}
            alt={leisureItem.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-black/20"
            onClick={() => setCurrentImageIndex((prev) => 
              prev === 0 ? leisureItem.images.length - 1 : prev - 1
            )}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-black/20"
            onClick={() => setCurrentImageIndex((prev) => 
              prev === leisureItem.images.length - 1 ? 0 : prev + 1
            )}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <Card className="p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{leisureItem.category}</Badge>
                {leisureItem.featured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{leisureItem.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {leisureItem.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(leisureItem.dates.start).toLocaleDateString()} - 
                  {new Date(leisureItem.dates.end).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-primary">
                From €{Math.min(...Object.values(leisureItem.pricing).map(p => p.price))}
              </div>
              <Button
                className="mt-4"
                onClick={() => setShowBooking(true)}
              >
                Book Now
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {leisureItem.description}
              </p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {leisureItem.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* FAQs */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {leisureItem.faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-medium mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                    {index < leisureItem.faqs.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-6">
                {leisureItem.reviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-4">
                    <Image
                      src={review.user.image}
                      alt={review.user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            {/* Organizer Card */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={leisureItem.organizer.image}
                  alt={leisureItem.organizer.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{leisureItem.organizer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {leisureItem.organizer.experience} experience
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-medium">{leisureItem.organizer.events}+</div>
                  <div className="text-sm text-muted-foreground">Events</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-medium">{leisureItem.rating}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Contact Organizer
              </Button>
            </Card>

            {/* Quick Info Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Event Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-sm text-muted-foreground">
                      {leisureItem.times.doors} - {leisureItem.times.end}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Capacity</div>
                    <div className="text-sm text-muted-foreground">
                      {leisureItem.remaining} tickets remaining
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Safety Measures</div>
                    <div className="text-sm text-muted-foreground">
                      Security and medical staff on-site
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Book Tickets</DialogTitle>
          </DialogHeader>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Select Ticket Type</Label>
                <Select value={ticketType} onValueChange={setTicketType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(leisureItem.pricing).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.name} - €{value.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <Label>Quantity</Label>
                <Select
                  value={quantity.toString()}
                  onValueChange={(value) => setQuantity(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'ticket' : 'tickets'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between font-medium">
                <span>Total Price:</span>
                <span className="text-xl">€{totalPrice}</span>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label>Card Number</Label>
                    <Input placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry Date</Label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span>Tickets ({quantity}x)</span>
                  <span>€{totalPrice}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span>Booking Fee</span>
                  <span>€{(totalPrice * 0.05).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>€{(totalPrice * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground mb-6">
                Your tickets have been sent to your email.
              </p>
              <div className="bg-muted p-4 rounded-lg text-left">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Booking Reference:</div>
                  <div className="font-medium">FEST12345</div>
                  <div>Event:</div>
                  <div className="font-medium">{leisureItem.title}</div>
                  <div>Date:</div>
                  <div className="font-medium">
                    {new Date(leisureItem.dates.start).toLocaleDateString()}
                  </div>
                  <div>Tickets:</div>
                  <div className="font-medium">
                    {quantity}x {selectedTicket.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {currentStep < 3 ? (
              <div className="flex justify-between w-full">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                )}
                <Button
                  className={currentStep > 1 ? '' : 'ml-auto'}
                  onClick={currentStep === 2 ? handlePayment : nextStep}
                >
                  {currentStep === 2 ? 'Pay Now' : 'Continue'}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowBooking(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}