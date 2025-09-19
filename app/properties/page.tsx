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
import { Slider } from "@/components/ui/Slider"
import { Switch } from "@/components/ui/Switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  Search,
  MapPin,
  Building,
  Bed,
  Bath,
  Square,
  Heart,
  Share,
  Filter,
  Grid,
  List,
  Map
} from "lucide-react"

export const metadata: Metadata = {
  title: "Properties - GREIA",
  description: "Browse and search properties on GREIA",
}

// Mock property data
const properties = [
  {
    id: 1,
    title: "Modern Apartment in City Center",
    type: "Apartment",
    price: "£2,500",
    priceType: "pcm",
    location: "Manchester City Center",
    bedrooms: 2,
    bathrooms: 2,
    size: "850 sq ft",
    image: "/properties/apartment-1.jpg",
    featured: true,
    status: "For Rent",
  },
  {
    id: 2,
    title: "Luxury Penthouse with City Views",
    type: "Penthouse",
    price: "£750,000",
    priceType: "For Sale",
    location: "Liverpool Docks",
    bedrooms: 3,
    bathrooms: 3,
    size: "1,500 sq ft",
    image: "/properties/penthouse-1.jpg",
    featured: true,
    status: "For Sale",
  },
  // Add more properties...
]

export default function PropertiesPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Map View
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search properties..." className="pl-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="pt-2">
                    <Slider
                      defaultValue={[0, 1000000]}
                      max={1000000}
                      step={1000}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="manchester">Manchester</SelectItem>
                      <SelectItem value="liverpool">Liverpool</SelectItem>
                      <SelectItem value="leeds">Leeds</SelectItem>
                      <SelectItem value="birmingham">Birmingham</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch id="featured" />
                  <Label htmlFor="featured">Featured Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="verified" />
                  <Label htmlFor="verified">Verified Only</Label>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <TabsTrigger value="map">
                <Map className="mr-2 h-4 w-4" />
                Map
              </TabsTrigger>
            </TabsList>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={property.image}
                      alt={property.title}
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
                      <Badge variant={property.status === "For Rent" ? "secondary" : "default"}>
                        {property.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{property.type}</span>
                    </div>
                    <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Bed className="mr-1 h-4 w-4" />
                        {property.bedrooms} Beds
                      </div>
                      <div className="flex items-center">
                        <Bath className="mr-1 h-4 w-4" />
                        {property.bathrooms} Baths
                      </div>
                      <div className="flex items-center">
                        <Square className="mr-1 h-4 w-4" />
                        {property.size}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="text-lg font-bold">
                      {property.price}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {property.priceType}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-4">
              {properties.map((property) => (
                <Card key={property.id}>
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-72 relative">
                      <img
                        src={property.image}
                        alt={property.title}
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
                        <Badge variant={property.status === "For Rent" ? "secondary" : "default"}>
                          {property.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{property.type}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                      <p className="text-muted-foreground mb-4">{property.location}</p>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                          <Bed className="mr-1 h-4 w-4" />
                          {property.bedrooms} Beds
                        </div>
                        <div className="flex items-center">
                          <Bath className="mr-1 h-4 w-4" />
                          {property.bathrooms} Baths
                        </div>
                        <div className="flex items-center">
                          <Square className="mr-1 h-4 w-4" />
                          {property.size}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold">
                          {property.price}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {property.priceType}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline">
                            <Share className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                          <Button>View Details</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px] w-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Map view will be integrated here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}