import { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel"
import {
  Heart,
  Share,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Check,
  Info,
  Star,
  User
} from "lucide-react"

export const metadata: Metadata = {
  title: "Property Details - GREIA",
  description: "View detailed property information",
}

// Mock property data
const property = {
  id: 1,
  title: "Luxury Penthouse with Panoramic Views",
  status: "For Sale",
  price: "£750,000",
  location: "Manchester City Center",
  description: "Stunning penthouse apartment offering breathtaking views of the city skyline. This exceptional property features high-end finishes, open-plan living spaces, and premium appliances throughout.",
  features: {
    bedrooms: 3,
    bathrooms: 2,
    size: "1,500 sq ft",
    type: "Penthouse",
    parking: "2 Spaces",
    heating: "Central",
    garden: "Roof Terrace",
    furnished: "Unfurnished"
  },
  amenities: [
    "24/7 Concierge",
    "Gym",
    "Swimming Pool",
    "Secure Parking",
    "CCTV",
    "Lift Access",
    "Bike Storage",
    "Residents Lounge"
  ],
  images: [
    "/properties/penthouse-1.jpg",
    "/properties/penthouse-2.jpg",
    "/properties/penthouse-3.jpg",
    "/properties/penthouse-4.jpg"
  ],
  agent: {
    name: "Sarah Johnson",
    company: "GREIA Luxury Properties",
    image: "/agents/sarah.jpg",
    rating: 4.9,
    reviews: 124
  },
  nearbyAmenities: [
    { name: "Train Station", distance: "0.2 miles" },
    { name: "Supermarket", distance: "0.3 miles" },
    { name: "Restaurants", distance: "0.1 miles" },
    { name: "Parks", distance: "0.4 miles" }
  ],
  viewings: {
    available: true,
    nextAvailable: "Tomorrow at 2:00 PM"
  }
}

export default function PropertyPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{property.location}</span>
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
            <Button>Book Viewing</Button>
          </div>
        </div>

        {/* Property Images Carousel */}
        <Card>
          <CardContent className="p-0">
            <Carousel className="w-full">
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative">
                      <img
                        src={image}
                        alt={`Property image ${index + 1}`}
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

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Property Details */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={property.status === "For Rent" ? "secondary" : "default"}>
                      {property.status}
                    </Badge>
                    <CardTitle className="mt-2 text-2xl">{property.price}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <Bed className="mx-auto h-5 w-5 text-muted-foreground" />
                      <span className="mt-1 text-sm">{property.features.bedrooms} Beds</span>
                    </div>
                    <div className="text-center">
                      <Bath className="mx-auto h-5 w-5 text-muted-foreground" />
                      <span className="mt-1 text-sm">{property.features.bathrooms} Baths</span>
                    </div>
                    <div className="text-center">
                      <Square className="mx-auto h-5 w-5 text-muted-foreground" />
                      <span className="mt-1 text-sm">{property.features.size}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">{property.description}</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-primary" />
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="features">
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(property.features).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <span className="capitalize">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="location">
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        Map will be integrated here
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {property.nearbyAmenities.map((amenity, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span>{amenity.name}</span>
                            <span className="text-muted-foreground">{amenity.distance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Property history and previous transactions will be displayed here.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Agent Card */}
            <Card>
              <CardHeader>
                <CardTitle>Listed by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <img
                    src={property.agent.image}
                    alt={property.agent.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{property.agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{property.agent.company}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm">{property.agent.rating}</span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        ({property.agent.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Agent
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Agent
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Viewing</CardTitle>
                <CardDescription>
                  Next available: {property.viewings.nextAvailable}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Viewing
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request Info
                </Button>
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Floor Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  EPC Certificate
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Info className="mr-2 h-4 w-4" />
                  Property Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Similar Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Similar properties would be mapped here */}
              <p className="text-muted-foreground">Similar properties will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}