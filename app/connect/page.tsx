import { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Building,
  Users,
  Briefcase,
  Star,
  Clock,
  Plus,
  Search,
  Filter
} from "lucide-react"

export const metadata: Metadata = {
  title: "Connect - GREIA",
  description: "Social networking and CRM for property and leisure",
}

// Mock feed data
const posts = [
  {
    id: 1,
    author: {
      name: "Sarah Wilson",
      role: "Property Agent",
      company: "Wilson Estates",
      avatar: "/avatars/sarah.jpg",
      verified: true
    },
    content: "Just listed a stunning 3-bed apartment in Manchester city centre! Modern finishes, amazing views, and great location. Book a viewing today! #PropertyListing #Manchester #LuxuryLiving",
    images: ["/properties/apartment-1.jpg", "/properties/apartment-2.jpg"],
    timestamp: "2 hours ago",
    likes: 45,
    comments: 12,
    shares: 8,
    type: "property",
    propertyDetails: {
      price: "£350,000",
      location: "Manchester City Centre",
      type: "Apartment",
      bedrooms: 3
    }
  },
  {
    id: 2,
    author: {
      name: "John Smith",
      role: "Service Provider",
      company: "Smith & Sons Plumbing",
      avatar: "/avatars/john.jpg",
      verified: true
    },
    content: "Completed another successful bathroom renovation project! Swipe to see the before and after transformation. Available for similar projects across Liverpool. #PlumbingServices #HomeImprovement",
    images: ["/services/bathroom-before.jpg", "/services/bathroom-after.jpg"],
    timestamp: "5 hours ago",
    likes: 32,
    comments: 8,
    shares: 4,
    type: "service",
    serviceDetails: {
      category: "Plumbing",
      rating: 4.9,
      reviews: 156
    }
  },
  {
    id: 3,
    author: {
      name: "Maritime Luxury",
      role: "Leisure Provider",
      company: "Maritime Luxury Charters",
      avatar: "/avatars/maritime.jpg",
      verified: true
    },
    content: "New weekend yacht charter packages available! Perfect for special occasions or corporate events. Early bird discount for September bookings. #YachtCharter #Liverpool #Luxury",
    images: ["/leisure/yacht-1.jpg"],
    timestamp: "1 day ago",
    likes: 67,
    comments: 15,
    shares: 23,
    type: "leisure",
    leisureDetails: {
      price: "From £500/day",
      location: "Liverpool Marina",
      capacity: "Up to 12 people"
    }
  }
]

// Mock network suggestions
const networkSuggestions = [
  {
    id: 1,
    name: "Emma Thompson",
    role: "Property Developer",
    company: "Thompson Developments",
    avatar: "/avatars/emma.jpg",
    mutualConnections: 12
  },
  {
    id: 2,
    name: "David Chen",
    role: "Interior Designer",
    company: "Chen Design Studio",
    avatar: "/avatars/david.jpg",
    mutualConnections: 8
  }
]

export default function ConnectPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Connect</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          {/* Main Feed */}
          <div className="md:col-span-5 space-y-4">
            {/* Create Post Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <Avatar>
                    <AvatarImage src="/avatars/user.jpg" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea placeholder="Share an update..." />
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Photo
                      </Button>
                      <Button variant="outline" size="sm">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Link
                      </Button>
                      <Button className="ml-auto">Post</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed Filters */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">All Posts</Button>
              <Button variant="outline" size="sm">Properties</Button>
              <Button variant="outline" size="sm">Services</Button>
              <Button variant="outline" size="sm">Leisure</Button>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold">{post.author.name}</h3>
                          {post.author.verified && (
                            <Badge variant="secondary" className="ml-2">Verified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.author.role} at {post.author.company}
                        </p>
                        <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Save Post</DropdownMenuItem>
                        <DropdownMenuItem>Hide Post</DropdownMenuItem>
                        <DropdownMenuItem>Report Post</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="mb-4">{post.content}</p>
                  {post.images && (
                    <div className="grid gap-2 grid-cols-2">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="rounded-lg object-cover w-full"
                          style={{ aspectRatio: "16/9" }}
                        />
                      ))}
                    </div>
                  )}
                  {post.type === "property" && (
                    <Card className="mt-4">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <PoundSterling className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.propertyDetails.price}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.propertyDetails.location}
                          </div>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.propertyDetails.type}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.propertyDetails.bedrooms} Bedrooms
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {post.type === "service" && (
                    <Card className="mt-4">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.serviceDetails.category}
                          </div>
                          <div className="flex items-center">
                            <Star className="mr-2 h-4 w-4 text-yellow-400" />
                            {post.serviceDetails.rating} ({post.serviceDetails.reviews} reviews)
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {post.type === "leisure" && (
                    <Card className="mt-4">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <PoundSterling className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.leisureDetails.price}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.leisureDetails.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            {post.leisureDetails.capacity}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Heart className="mr-2 h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="mr-2 h-4 w-4" />
                      {post.shares}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardHeader className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/user.jpg" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Your Profile</h3>
                    <p className="text-sm text-muted-foreground">View and edit profile</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="font-semibold">245</p>
                    <p className="text-sm text-muted-foreground">Connections</p>
                  </div>
                  <div>
                    <p className="font-semibold">18</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Suggestions */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Grow Your Network</CardTitle>
                <CardDescription>People you may know</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {networkSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={suggestion.avatar} />
                        <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{suggestion.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.role} at {suggestion.company}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.mutualConnections} mutual connections
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    #PropertyMarket
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    #HomeImprovement
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    #LuxuryLiving
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    #RealEstate
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