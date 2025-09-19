import { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  Search,
  Briefcase,
  Star,
  MapPin,
  Clock,
  Calendar,
  Filter,
  Grid,
  List,
  ChevronRight,
  Heart,
  MessageSquare,
  User,
  Shield,
  Clock8
} from "lucide-react"

export const metadata: Metadata = {
  title: "Services - GREIA",
  description: "Find and book professional services on GREIA",
}

// Mock services data
const services = [
  {
    id: 1,
    title: "Professional Plumbing Services",
    category: "Trades",
    provider: "John Smith",
    rating: 4.8,
    reviews: 156,
    location: "Manchester",
    price: "£50/hr",
    availability: "Available Today",
    verified: true,
    image: "/services/plumbing.jpg",
    description: "Expert plumbing services with 15+ years experience. Emergency callouts available.",
  },
  {
    id: 2,
    title: "Property Photography",
    category: "Professional",
    provider: "Sarah Wilson",
    rating: 4.9,
    reviews: 89,
    location: "Liverpool",
    price: "£200/session",
    availability: "Next Day",
    verified: true,
    image: "/services/photography.jpg",
    description: "Professional property photography for real estate listings and marketing.",
  },
  // Add more services...
]

const categories = [
  { id: "trades", name: "Trades", count: 245 },
  { id: "professional", name: "Professional Services", count: 189 },
  { id: "property", name: "Property Services", count: 167 },
  { id: "legal", name: "Legal Services", count: 92 },
  { id: "financial", name: "Financial Services", count: 78 },
  { id: "marketing", name: "Marketing", count: 56 },
]

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <Briefcase className="mr-2 h-4 w-4" />
              Offer Services
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Search Services</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search services..." className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manchester">Manchester</SelectItem>
                    <SelectItem value="liverpool">Liverpool</SelectItem>
                    <SelectItem value="leeds">Leeds</SelectItem>
                    <SelectItem value="birmingham">Birmingham</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Available Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:bg-accent">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  {category.name}
                  <ChevronRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>{category.count} providers</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* View Toggle */}
        <Tabs defaultValue="grid" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="mr-2 h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="mr-2 h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
            <Select defaultValue="recommended">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge>{service.category}</Badge>
                      {service.verified && (
                        <Badge variant="secondary">
                          <Shield className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-1">{service.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          {service.provider}
                        </div>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 text-yellow-400" />
                          {service.rating} ({service.reviews})
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {service.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {service.availability}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="text-lg font-bold">{service.price}</div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {services.map((service) => (
              <Card key={service.id}>
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-72 relative">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-x-2">
                        <Badge>{service.category}</Badge>
                        {service.verified && (
                          <Badge variant="secondary">
                            <Shield className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-400" />
                        {service.rating} ({service.reviews} reviews)
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {service.provider}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {service.location}
                      </div>
                      <div className="flex items-center">
                        <Clock8 className="mr-1 h-4 w-4" />
                        {service.availability}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold">{service.price}</div>
                      <div className="space-x-2">
                        <Button variant="outline">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                        <Button>Book Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}