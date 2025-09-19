import { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { DashboardNav } from "@/components/navigation/DashboardNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  Building,
  Briefcase,
  Compass,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Bell,
  Eye,
  Star,
  ArrowUpRight,
  Clock
} from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dashboard - GREIA",
  description: "Manage your GREIA activities and insights",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Services
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +3 new bookings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leisure Bookings
              </CardTitle>
              <Compass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +5 this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Network Size
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">
                +28 new connections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Activity */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">New property viewing request</p>
                        <p className="text-sm text-muted-foreground">
                          123 Main Street - Tomorrow at 2:00 PM
                        </p>
                      </div>
                      <div className="ml-auto font-medium">Just now</div>
                    </div>
                    <div className="flex items-center">
                      <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">New service review</p>
                        <p className="text-sm text-muted-foreground">
                          5-star review for plumbing service
                        </p>
                      </div>
                      <div className="ml-auto font-medium">2h ago</div>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">New message</p>
                        <p className="text-sm text-muted-foreground">
                          From Sarah about property listing
                        </p>
                      </div>
                      <div className="ml-auto font-medium">5h ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">Property Viewing</p>
                        <p className="text-sm text-muted-foreground">
                          Tomorrow at 2:00 PM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">Service Appointment</p>
                        <p className="text-sm text-muted-foreground">
                          Friday at 10:00 AM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">Networking Event</p>
                        <p className="text-sm text-muted-foreground">
                          Next Tuesday at 6:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:bg-accent">
                <Link href="/properties/create">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm font-medium">
                      <Building className="mr-2 h-4 w-4" />
                      Add Property
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="cursor-pointer hover:bg-accent">
                <Link href="/services/create">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm font-medium">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Add Service
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="cursor-pointer hover:bg-accent">
                <Link href="/leisure/create">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm font-medium">
                      <Compass className="mr-2 h-4 w-4" />
                      Add Listing
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="cursor-pointer hover:bg-accent">
                <Link href="/connect/add">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm font-medium">
                      <Users className="mr-2 h-4 w-4" />
                      Add Contact
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                </Link>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Analytics charts and graphs will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Notification items would go here */}
                  <p className="text-muted-foreground">Your notifications will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Message items would go here */}
                  <p className="text-muted-foreground">Your messages will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}