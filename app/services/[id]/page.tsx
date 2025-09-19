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
  Star,
  MapPin,
  Clock,
  Shield,
  MessageSquare,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  FileText,
  ThumbsUp,
  Award,
  CheckCircle,
  Clock8,
  Share,
  Heart
} from "lucide-react"

export const metadata: Metadata = {
  title: "Service Details - GREIA",
  description: "View and book professional services",
}

// Mock service data
const service = {
  id: 1,
  title: "Professional Plumbing Services",
  category: "Trades",
  provider: {
    name: "John Smith",
    company: "Smith & Sons Plumbing",
    image: "/providers/john-smith.jpg",
    rating: 4.8,
    reviews: 156,
    verified: true,
    memberSince: "2020",
    completedJobs: 450,
    responseTime: "Under 1 hour",
    languages: ["English", "Spanish"],
    qualifications: [
      "City & Guilds Level 3 Plumbing",
      "Gas Safe Registered",
      "Public Liability Insurance"
    ]
  },
  pricing: {
    hourlyRate: "£50/hr",
    calloutFee: "£30",
    minimumCharge: "1 hour",
    packages: [
      {
        name: "Basic Inspection",
        price: "£80",
        duration: "1 hour",
        description: "Initial inspection and minor repairs"
      },
      {
        name: "Full Service",
        price: "£200",
        duration: "4 hours",
        description: "Comprehensive plumbing service and maintenance"
      }
    ]
  },
  availability: {
    nextSlot: "Today at 4:00 PM",
    workingHours: "Mon-Sat: 8:00 AM - 6:00 PM",
    emergency: true
  },
  location: {
    area: "Manchester",
    coverage: "15 miles radius",
    address: "123 Service Street, Manchester, M1 1AB"
  },
  description: "Professional plumbing services with over 15 years of experience. Specializing in emergency repairs, installations, and maintenance. Available for both residential and commercial properties.",
  services: [
    "Emergency Repairs",
    "Pipe Installation",
    "Bathroom Fitting",
    "Boiler Services",
    "Drain Cleaning",
    "Water Heater Installation",
    "Leak Detection",
    "Preventive Maintenance"
  ],
  reviews: [
    {
      id: 1,
      user: "Sarah Johnson",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent service! Fixed our emergency leak quickly and professionally.",
      verified: true
    },
    {
      id: 2,
      user: "Mike Peters",
      rating: 4,
      date: "1 week ago",
      comment: "Very knowledgeable and efficient. Would recommend.",
      verified: true
    }
  ],
  images: [
    "/services/plumbing-1.jpg",
    "/services/plumbing-2.jpg",
    "/services/plumbing-3.jpg"
  ]
}

export default function ServicePage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <Badge>{service.category}</Badge>
              {service.provider.verified && (
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified Provider
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">{service.title}</h1>
            <div className="flex items-center space-x-4 mt-1 text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {service.location.area}
              </div>
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-400" />
                {service.provider.rating} ({service.provider.reviews} reviews)
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
            {/* Service Images */}
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-2 p-2">
                  <div className="col-span-2">
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  {service.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${service.title} ${index + 2}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>About This Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{service.description}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {service.services.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.reviews.map((review) => (
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Choose a service package or hourly rate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Hourly Rate</span>
                    <span className="font-bold">{service.pricing.hourlyRate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Callout Fee</span>
                    <span>{service.pricing.calloutFee}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {service.pricing.packages.map((pkg, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <span className="font-bold">{pkg.price}</span>
                        </div>
                        <CardDescription>{pkg.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
                <CardDescription>
                  Next available: {service.availability.nextSlot}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Calendar mode="single" className="rounded-md border" />
                </div>
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9:00 AM</SelectItem>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                      <SelectItem value="13">1:00 PM</SelectItem>
                      <SelectItem value="14">2:00 PM</SelectItem>
                      <SelectItem value="15">3:00 PM</SelectItem>
                      <SelectItem value="16">4:00 PM</SelectItem>
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
                <div className="flex items-center space-x-4">
                  <img
                    src={service.provider.image}
                    alt={service.provider.name}
                    className="h-16 w-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{service.provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.provider.company}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock8 className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Member since {service.provider.memberSince}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <ThumbsUp className="h-4 w-4 text-primary mb-1" />
                    <div className="font-medium">{service.provider.completedJobs}</div>
                    <div className="text-muted-foreground">Jobs Completed</div>
                  </div>
                  <div>
                    <Clock className="h-4 w-4 text-primary mb-1" />
                    <div className="font-medium">{service.provider.responseTime}</div>
                    <div className="text-muted-foreground">Response Time</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Qualifications</h4>
                  {service.provider.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center">
                      <Award className="mr-2 h-4 w-4 text-primary" />
                      {qual}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}