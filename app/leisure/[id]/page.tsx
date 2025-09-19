import { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Calendar } from "@/components/ui/Calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel"
import {
  Star,
  MapPin,
  Clock,
  Users,
  Calendar as CalendarIcon,
  Heart,
  Share,
  CheckCircle,
  Info,
  Shield,
  MessageSquare,
  Phone,
  AlertCircle
} from "lucide-react"

export const metadata: Metadata = {
  title: "Leisure Item Details - GREIA",
  description: "View and book leisure activities and rentals",
}

// Mock leisure item data
const item = {
  id: 1,
  title: "Luxury Yacht Charter",
  category: "Boat Rentals",
  type: "rental",
  price: "£500/day",
  deposit: "£200",
  location: {
    name: "Liverpool Marina",
    address: "Coburg Wharf, Liverpool L3 4BP",
    coordinates: { lat: 53.4084, lng: -2.9916 }
  },
  rating: 4.9,
  reviews: 28,
  capacity: {
    min: 2,
    max: 12,
    recommended: 8
  },
  duration: {
    type: "Full day",
    hours: 8,
    checkIn: "09:00",
    checkOut: "17:00"
  },
  description: "Experience luxury on the water with our modern yacht charter. Perfect for special occasions, corporate events, or a day of luxury sailing. Includes professional captain and crew.",
  features: [
    "Professional captain",
    "Experienced crew",
    "Fully equipped kitchen",
    "Sound system",
    "Sun deck",
    "Indoor lounge",
    "Bathroom facilities",
    "Safety equipment"
  ],
  amenities: [
    "Catering available",
    "Bar service",
    "Towels provided",
    "WiFi",
    "Bluetooth audio",
    "Air conditioning",
    "Fishing equipment",
    "Water toys"
  ],
  images: [
    "/leisure/yacht-1.jpg",
    "/leisure/yacht-2.jpg",
    "/leisure/yacht-3.jpg",
    "/leisure/yacht-4.jpg"
  ],
  provider: {
    name: "Maritime Luxury Charters",
    rating: 4.8,
    reviews: 156,
    verified: true,
    response: "Usually responds within 1 hour",
    experience: "10+ years",
    licenses: ["Maritime License", "Commercial Operator", "Safety Certified"]
  },
  policies: {
    cancellation: "Free cancellation up to 48 hours before",
    insurance: "Insurance included",
    deposit: "Refundable security deposit required",
    minimumAge: "21 years",
    requirements: ["Valid ID", "Credit card for deposit"]
  },
  availability: {
    nextAvailable: "Tomorrow",
    popularDates: ["Weekends", "Bank Holidays"],
    restrictions: "Subject to weather conditions"
  },
  reviews: [
    {
      id: 1,
      user: "James Wilson",
      rating: 5,
      date: "Last week",
      comment: "Incredible experience! The crew was professional and the yacht was immaculate.",
      verified: true
    },
    {
      id: 2,
      user: "Sarah Thompson",
      rating: 5,
      date: "2 weeks ago",
      comment: "Perfect day out for our corporate event. Everything was well organized.",
      verified: true
    }
  ]
}

export default function LeisureItemPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <Badge>{item.category}</Badge>
              {item.provider.verified && (
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified Provider
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">{item.title}</h1>
            <div className="flex items-center space-x-4 mt-1 text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {item.location.name}
              </div>
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-400" />
                {item.rating} ({item.reviews} reviews)
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Image Carousel */}
            <Card>
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {item.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-video relative">
                          <img
                            src={image}
                            alt={`${item.title} ${index + 1}`}
                            className="object-cover w-full h-full rounded-lg"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            {/* Details Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">{item.description}</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h4 className="font-medium">Key Information</h4>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Duration</span>
                              <span>{item.duration.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Capacity</span>
                              <span>{item.capacity.min}-{item.capacity.max} people</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Check-in</span>
                              <span>{item.duration.checkIn}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Check-out</span>
                              <span>{item.duration.checkOut}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Included</h4>
                          <div className="grid gap-2">
                            {item.features.slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-4">Features</h4>
                        <div className="grid gap-2">
                          {item.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-4">Amenities</h4>
                        <div className="grid gap-2">
                          {item.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        Map will be integrated here
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Address</h4>
                        <p className="text-muted-foreground">{item.location.address}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    {item.reviews.map((review) => (
                      <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.user}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Booking
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400" : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="policies" className="space-y-4">
                    <div className="grid gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Cancellation Policy</h4>
                        <p className="text-muted-foreground">{item.policies.cancellation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Minimum age: {item.policies.minimumAge}</p>
                          {item.policies.requirements.map((req, index) => (
                            <div key={index} className="flex items-center">
                              <Info className="mr-2 h-4 w-4 text-primary" />
                              {req}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Insurance & Deposit</h4>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">{item.policies.insurance}</p>
                          <p className="text-muted-foreground">{item.policies.deposit}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book this {item.type}</CardTitle>
                <CardDescription>
                  Next available: {item.availability.nextAvailable}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{item.price}</span>
                    <Badge variant="outline">{item.duration.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.deposit} deposit required
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Calendar mode="single" className="rounded-md border" />
                </div>
                <div className="space-y-2">
                  <Label>Group Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: item.capacity.max - item.capacity.min + 1 },
                        (_, i) => i + item.capacity.min
                      ).map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} {size === 1 ? "person" : "people"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card>
              <CardHeader>
                <CardTitle>About the Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{item.provider.name}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="mr-1 h-4 w-4 text-yellow-400" />
                    <span>{item.provider.rating}</span>
                    <span className="mx-1">•</span>
                    <span className="text-muted-foreground">
                      {item.provider.reviews} reviews
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.provider.experience} experience
                  </p>
                </div>
                <div className="space-y-2">
                  {item.provider.licenses.map((license, index) => (
                    <div key={index} className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-primary" />
                      {license}
                    </div>
                  ))}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {item.provider.response}
                </div>
                <div className="space-y-2">
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Provider
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Provider
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Notice */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Safety First</p>
                    <p>All bookings are protected by GREIA's safety policies and insurance coverage.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}