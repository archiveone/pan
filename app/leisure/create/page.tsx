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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Checkbox } from "@/components/ui/Checkbox"
import { Switch } from "@/components/ui/Switch"
import { Separator } from "@/components/ui/Separator"
import {
  Car,
  Boat,
  Home,
  Ticket,
  Upload,
  MapPin,
  Clock,
  Users,
  PoundSterling,
  Calendar,
  Shield,
  FileText,
  Info,
  CheckCircle
} from "lucide-react"

export const metadata: Metadata = {
  title: "Create Leisure Listing - GREIA",
  description: "List your rental or experience on GREIA",
}

const categories = [
  { id: "cars", name: "Car Rentals", icon: Car },
  { id: "boats", name: "Boat Rentals", icon: Boat },
  { id: "venues", name: "Venue Hire", icon: Home },
  { id: "experiences", name: "Experiences", icon: Ticket }
]

const amenities = [
  "Air Conditioning",
  "Audio System",
  "Bathroom",
  "Catering Available",
  "Heating",
  "Kitchen",
  "Parking",
  "Pet Friendly",
  "WiFi",
  "Wheelchair Accessible"
]

export default function CreateLeisurePage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create Leisure Listing</h2>
            <p className="text-muted-foreground mt-2">
              List your rental or experience on GREIA
            </p>
          </div>
          <Button variant="outline">Save Progress</Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">
              <Info className="mr-2 h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="details">
              <CheckCircle className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="media">
              <Upload className="mr-2 h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Calendar className="mr-2 h-4 w-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <PoundSterling className="mr-2 h-4 w-4" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about your rental or experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your rental or experience..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Hourly</SelectItem>
                        <SelectItem value="half-day">Half Day</SelectItem>
                        <SelectItem value="full-day">Full Day</SelectItem>
                        <SelectItem value="custom">Custom Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Listing Details</CardTitle>
                <CardDescription>
                  Add specific details about your offering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Capacity</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Minimum Capacity</Label>
                      <Input type="number" min="1" placeholder="Min people" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Capacity</Label>
                      <Input type="number" min="1" placeholder="Max people" />
                    </div>
                    <div className="space-y-2">
                      <Label>Recommended Group Size</Label>
                      <Input type="number" min="1" placeholder="Recommended size" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Features & Amenities</h3>
                  <div className="grid gap-2 md:grid-cols-2">
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
                    <div className="col-span-2 mt-2">
                      <Input placeholder="Add custom feature..." />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Requirements & Rules</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="age-requirement" />
                      <Label htmlFor="age-requirement">Age Requirement</Label>
                    </div>
                    {/* Add more switches for other requirements */}
                    <Textarea
                      placeholder="Additional rules or requirements..."
                      className="mt-4"
                    />
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
                  Upload photos and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Photos</h3>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-8 w-4 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop your photos here, or click to browse
                    </p>
                    <Button variant="outline" className="mt-4">
                      Upload Photos
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload at least 5 high-quality photos. First photo will be your cover image.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Documents</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Shield className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-medium">Insurance Documents</h4>
                          <p className="text-sm text-muted-foreground">
                            Upload valid insurance documentation
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Upload</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-medium">Terms & Conditions</h4>
                          <p className="text-sm text-muted-foreground">
                            Upload your terms and conditions
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Upload</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
                <CardDescription>
                  Set your availability and booking preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Operating Hours</h3>
                  <div className="grid gap-4">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center space-x-4">
                        <Switch id={day.toLowerCase()} />
                        <Label htmlFor={day.toLowerCase()}>{day}</Label>
                        <Select>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Start" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">9:00</SelectItem>
                            <SelectItem value="10">10:00</SelectItem>
                            <SelectItem value="11">11:00</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>to</span>
                        <Select>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="End" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="17">17:00</SelectItem>
                            <SelectItem value="18">18:00</SelectItem>
                            <SelectItem value="19">19:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Booking Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="instant" />
                      <Label htmlFor="instant">Allow Instant Booking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="multiple" />
                      <Label htmlFor="multiple">Allow Multiple Bookings per Day</Label>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Minimum Notice Period</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notice period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
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
                  Set your pricing and payment preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Base Pricing</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Base Price</Label>
                      <div className="relative">
                        <PoundSterling className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" placeholder="Enter base price" type="number" min="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Price Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per-hour">Per Hour</SelectItem>
                          <SelectItem value="per-day">Per Day</SelectItem>
                          <SelectItem value="per-person">Per Person</SelectItem>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Additional Fees</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="deposit" />
                      <Label htmlFor="deposit">Require Security Deposit</Label>
                    </div>
                    {/* Conditional deposit amount input */}
                    <div className="flex items-center space-x-2">
                      <Switch id="cleaning" />
                      <Label htmlFor="cleaning">Cleaning Fee</Label>
                    </div>
                    {/* Conditional cleaning fee input */}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Discounts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="weekly" />
                      <Label htmlFor="weekly">Weekly Discount</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="monthly" />
                      <Label htmlFor="monthly">Monthly Discount</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="group" />
                      <Label htmlFor="group">Group Discount</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Cancellation Policy</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancellation policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible (24 hours)</SelectItem>
                      <SelectItem value="moderate">Moderate (5 days)</SelectItem>
                      <SelectItem value="strict">Strict (7 days)</SelectItem>
                    </SelectContent>
                  </Select>
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