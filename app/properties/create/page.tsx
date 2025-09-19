import { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form"
import { Checkbox } from "@/components/ui/Checkbox"
import { Switch } from "@/components/ui/Switch"
import { Separator } from "@/components/ui/Separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  Building,
  Upload,
  MapPin,
  Bed,
  Bath,
  Square,
  PoundSterling,
  Info,
  Camera,
  FileText,
  Calendar,
  Check
} from "lucide-react"

export const metadata: Metadata = {
  title: "Create Property Listing - GREIA",
  description: "Create a new property listing on GREIA",
}

const amenities = [
  "Air Conditioning",
  "Balcony",
  "Central Heating",
  "Dishwasher",
  "Elevator",
  "Furnished",
  "Garden",
  "Gym",
  "Parking",
  "Pet Friendly",
  "Pool",
  "Security System",
  "Storage",
  "Washer/Dryer",
  "Wi-Fi"
]

export default function CreatePropertyPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Create Property Listing</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline">Save as Draft</Button>
            <Button>Publish Listing</Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <Building className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="mr-2 h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="media">
              <Camera className="mr-2 h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <PoundSterling className="mr-2 h-4 w-4" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Property Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Enter the basic information about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Modern Apartment in City Center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Listing Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="for-sale">For Sale</SelectItem>
                        <SelectItem value="for-rent">For Rent</SelectItem>
                        <SelectItem value="off-market">Off Market</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      placeholder="Number of bedrooms"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      placeholder="Number of bathrooms"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Property Size (sq ft)</Label>
                    <Input
                      id="size"
                      type="number"
                      min="0"
                      placeholder="Total area in sq ft"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property..."
                    className="min-h-[150px]"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Amenities</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox id={amenity.toLowerCase()} />
                        <label
                          htmlFor={amenity.toLowerCase()}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>
                  Enter the property location information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      placeholder="Enter postcode"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Map Location</Label>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    Map integration will be added here
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nearby Amenities</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Input placeholder="Amenity name" className="flex-1" />
                      <Input placeholder="Distance" className="w-24" />
                    </div>
                    <Button variant="outline" className="w-full md:w-auto">
                      Add More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media Content</CardTitle>
                <CardDescription>
                  Upload photos, videos, and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Property Photos</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop your photos here, or click to browse
                    </p>
                    <Button variant="outline" className="mt-4">
                      Upload Photos
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Virtual Tour</Label>
                  <Input
                    placeholder="Enter virtual tour URL"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Documents</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Floor Plan</span>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Upload
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>EPC Certificate</span>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Details</CardTitle>
                <CardDescription>
                  Set your property pricing and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="Enter price"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price-type">Price Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="negotiable">Negotiable</SelectItem>
                        <SelectItem value="offers">Offers Over</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="private-listing" />
                    <Label htmlFor="private-listing">Private Listing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="featured-listing" />
                    <Label htmlFor="featured-listing">Featured Listing</Label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="available-from">Available From</Label>
                      <Input
                        id="available-from"
                        type="date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="viewing-times">Viewing Times</Label>
                      <Input
                        id="viewing-times"
                        placeholder="e.g. Mon-Fri, 9am-5pm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Save as Draft</Button>
                <Button>Publish Listing</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}