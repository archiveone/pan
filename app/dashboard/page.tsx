import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Building2,
  Briefcase,
  Compass,
  Users,
  Bell,
  MessageCircle,
  Star,
  TrendingUp,
  Calendar,
  Settings,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />

      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold">Welcome back, Sean! 👋</h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your GREIA account
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              {
                title: 'Property Views',
                value: '2,847',
                change: '+12.5%',
                icon: Building2,
                color: 'text-blue-600'
              },
              {
                title: 'Service Bookings',
                value: '124',
                change: '+8.2%',
                icon: Briefcase,
                color: 'text-purple-600'
              },
              {
                title: 'Leisure Events',
                value: '38',
                change: '+15.3%',
                icon: Compass,
                color: 'text-pink-600'
              },
              {
                title: 'Network Growth',
                value: '523',
                change: '+5.7%',
                icon: Users,
                color: 'text-green-600'
              }
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                        <p className="text-sm text-green-600 mt-1">
                          {stat.change} this month
                        </p>
                      </div>
                      <div className={`${stat.color} bg-gray-100 p-3 rounded-full`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="leisure">Leisure</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content Area */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                          Your latest interactions and updates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              icon: Building2,
                              title: 'New Property View',
                              description: 'Someone viewed your luxury apartment listing',
                              time: '2 hours ago'
                            },
                            {
                              icon: MessageCircle,
                              title: 'New Message',
                              description: 'John Smith sent you a message about your property',
                              time: '4 hours ago'
                            },
                            {
                              icon: Star,
                              title: 'New Review',
                              description: 'You received a 5-star review for your service',
                              time: 'Yesterday'
                            }
                          ].map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="bg-primary/10 p-2 rounded-full">
                                <activity.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>
                          How your listings are performing
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              label: 'Profile Completion',
                              value: 85,
                              color: 'bg-blue-600'
                            },
                            {
                              label: 'Response Rate',
                              value: 92,
                              color: 'bg-green-600'
                            },
                            {
                              label: 'Booking Rate',
                              value: 78,
                              color: 'bg-purple-600'
                            }
                          ].map((metric, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{metric.label}</span>
                                <span className="font-medium">{metric.value}%</span>
                              </div>
                              <Progress
                                value={metric.value}
                                className={metric.color}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Building2 className="mr-2 h-4 w-4" />
                            Add Property
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Create Service
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Event
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Account Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              title: 'Property Viewing',
                              date: 'Sep 6, 2:00 PM',
                              icon: Building2
                            },
                            {
                              title: 'Service Booking',
                              date: 'Sep 8, 10:30 AM',
                              icon: Briefcase
                            },
                            {
                              title: 'Network Event',
                              date: 'Sep 10, 6:00 PM',
                              icon: Users
                            }
                          ].map((event, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="bg-primary/10 p-2 rounded-full">
                                <event.icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {event.date}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}