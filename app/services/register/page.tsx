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
import {
  Briefcase,
  Upload,
  Shield,
  MapPin,
  Clock,
  FileText,
  Award,
  Calendar,
  PoundSterling,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export const metadata: Metadata = {
  title: "Register as Service Provider - GREIA",
  description: "Join GREIA as a verified service provider",
}

const serviceCategories = [
  { id: "trades", name: "Trades", examples: "Plumber, Electrician, Builder" },
  { id: "professional", name: "Professional Services", examples: "Architect, Surveyor, Designer" },
  { id: "property", name: "Property Services", examples: "Property Manager, Estate Agent" },
  { id: "legal", name: "Legal Services", examples: "Solicitor, Conveyancer" },
  { id: "financial", name: "Financial Services", examples: "Mortgage Advisor, Accountant" },
  { id: "marketing", name: "Marketing Services", examples: "Photographer, Copywriter" }
]

export default function ServiceProviderRegistration() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Register as Service Provider</h2>
            <p className="text-muted-foreground mt-2">
              Join our network of verified professionals and grow your business
            </p>
          </div>
          <Button variant="outline">Save Progress</Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">
              <Briefcase className="mr-2 h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="mr-2 h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="services">
              <CheckCircle className="mr-2 h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Calendar className="mr-2 h-4 w-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="payment">
              <PoundSterling className="mr-2 h-4 w-4" />
              Payment
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about you and your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Service Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Business Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter business phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your business and services..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Area</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Primary Location</Label>
                      <Input
                        id="location"
                        placeholder="Enter your primary location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="radius">Service Radius (miles)</Label>
                      <Input
                        id="radius"
                        type="number"
                        placeholder="Enter service radius"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
                <CardDescription>
                  Upload required documents to verify your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Required Documents</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-medium">Business Registration</h4>
                          <p className="text-sm text-muted-foreground">
                            Company registration or self-employed documentation
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Upload</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Shield className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-medium">Insurance Documents</h4>
                          <p className="text-sm text-muted-foreground">
                            Public liability and professional indemnity insurance
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Upload</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Award className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="font-medium">Qualifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Professional certifications and qualifications
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Upload</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Identity Verification</h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Verify Your Identity</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete identity verification through Stripe Identity
                        </p>
                      </div>
                      <Button>Start Verification</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Define your services and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Add Service</Label>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input placeholder="Service name" />
                        <Input placeholder="Price (optional)" />
                      </div>
                      <Textarea
                        placeholder="Service description..."
                        className="mt-2"
                      />
                      <Button variant="outline" className="mt-2">
                        Add Another Service
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Expertise & Skills</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="skill1" />
                      <label htmlFor="skill1">Residential Properties</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="skill2" />
                      <label htmlFor="skill2">Commercial Properties</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="skill3" />
                      <label htmlFor="skill3">Emergency Services</label>
                    </div>
                    <Input
                      placeholder="Add custom skill..."
                      className="mt-2"
                    />
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
                  Set your working hours and booking preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Working Hours</h3>
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

                <div className="space-y-4">
                  <h3 className="font-medium">Booking Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="instant" />
                      <Label htmlFor="instant">Allow Instant Booking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="emergency" />
                      <Label htmlFor="emergency">Available for Emergency Callouts</Label>
                    </div>
                    <div className="space-y-2">
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

          {/* Payment */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Set up your payment and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Payment Methods</h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Connect with Stripe</h4>
                        <p className="text-sm text-muted-foreground">
                          Set up secure payments and get paid directly to your bank account
                        </p>
                      </div>
                      <Button>Connect Account</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Pricing Structure</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="hourly" />
                      <Label htmlFor="hourly">Hourly Rate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="fixed" />
                      <Label htmlFor="fixed">Fixed Price Services</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="callout" />
                      <Label htmlFor="callout">Callout Fee</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Commission & Fees</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      GREIA charges a 10% commission on all bookings. This includes payment processing, 
                      marketing, and platform maintenance.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Save as Draft</Button>
                <Button>Submit for Review</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}