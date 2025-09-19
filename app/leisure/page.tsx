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
import { DatePicker } from "@/components/ui/DatePicker"
import {
  Search,
  Car,
  Boat,
  Home,
  Ticket,
  MapPin,
  Calendar,
  Users,
  Star,
  Filter,
  Grid,
  List,
  Heart,
  Clock,
  Info
} from "lucide-react"

export const metadata: Metadata = {
  title: "Leisure - GREIA",
  description: "Discover and book rentals and experiences",
}

// Mock leisure data
const leisureItems = [
  {
    id: 1,
    title: "Luxury Yacht Charter",
    category: "Boat Rentals",
    type: "rental",
    price: "£500/day",
    location: "Liverpool Marina",
    rating: 4.9,
    reviews: 28,
    capacity: "12 people",
    duration: "Full day",
    image: "/leisure/yacht.jpg",
    description: "Experience luxury on the water with our modern yacht charter.",
    features: ["Captain included", "Catering available", "Sound system", "Sun deck"],
    availability: "Available this weekend"
  },
  {
    id: 2,
    title: "Wine Tasting Experience",
    category: "Experiences",
    type: "experience",
    price: "£45/person",
    location: "Manchester City Centre",
    rating: 4.8,
    reviews: 156,
    capacity: "8 people",
    duration: "2 hours",
    image: "/leisure/wine.jpg",
    description: "Guided wine tasting with expert sommeliers featuring premium selections.",
    features: ["Expert guide", "Premium wines", "Cheese pairing", "Certificate"],
    availability: "Multiple dates"
  },
  // Add more items...
]

const categories = [
  { id: "cars", name: "Car Rentals", icon: Car },
  { id: "boats", name: "Boat Rentals", icon: Boat },
  { id: "venues", name: "Venue Hire", icon: Home },
  { id: "experiences", name: "Experiences", icon: Ticket }
]

export default function LeisurePage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Leisure</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search rentals & experiences..." className="pl-8" />
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
                        <div className="flex items-center">
                          <category.icon className="mr-2 h-4 w-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker />
              </div>
              <div className="space-y-2">
                <Label>Group Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 people</SelectItem>
                    <SelectItem value="3-5">3-5 people</SelectItem>
                    <SelectItem value="6-10">6-10 people</SelectItem>
                    <SelectItem value="10+">10+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:bg-accent">
              <CardHeader className="p-4">
                <div className="flex items-center space-x-2">
                  <category.icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
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
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leisureItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={item.image}
                      alt={item.title}
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
                      <Badge>{item.category}</Badge>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-400" />
                        {item.rating} ({item.reviews})
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {item.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {item.capacity}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {item.duration}
                        </div>
                        <div className="flex items-center">
                          <Info className="mr-1 h-4 w-4" />
                          {item.availability}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="text-lg font-bold">{item.price}</div>
                    <Button>Book Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {leisureItems.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-72 relative">
                    <img
                      src={item.image}
                      alt={item.title}
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
                      <Badge>{item.category}</Badge>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-400" />
                        {item.rating} ({item.reviews} reviews)
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {item.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {item.capacity}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {item.duration}
                      </div>
                      <div className="flex items-center">
                        <Info className="mr-1 h-4 w-4" />
                        {item.availability}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold">{item.price}</div>
                      <div className="space-x-2">
                        <Button variant="outline">View Details</Button>
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