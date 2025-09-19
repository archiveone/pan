'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Building2,
  Star,
  MessageSquare,
  Calendar,
  FileText
} from 'lucide-react'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional()
})

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const profileFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Your full name',
      validation: {
        required: 'Name is required'
      }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Your email address',
      validation: {
        required: 'Email is required'
      }
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: 'Your phone number'
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      placeholder: 'Your company name'
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      placeholder: 'Tell us about yourself'
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Your location'
    },
    {
      name: 'website',
      label: 'Website',
      type: 'url',
      placeholder: 'Your website URL'
    }
  ]

  const handleProfileUpdate = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true)
    setError('')

    try {
      // Handle profile update logic here
      console.log('Profile update:', data)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const activities = [
    {
      icon: Building2,
      title: 'Property Viewed',
      description: 'You viewed "Modern City Apartment"',
      time: '2 hours ago'
    },
    {
      icon: MessageSquare,
      title: 'Message Received',
      description: 'New message from John Smith',
      time: '4 hours ago'
    },
    {
      icon: Star,
      title: 'Review Posted',
      description: 'You reviewed ABC Services',
      time: 'Yesterday'
    }
  ]

  const listings = [
    {
      type: 'Property',
      title: 'Modern City Apartment',
      status: 'Active',
      views: 245,
      inquiries: 12
    },
    {
      type: 'Service',
      title: 'Professional Photography',
      status: 'Active',
      views: 156,
      inquiries: 8
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <User className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">John Smith</h1>
                <p className="text-primary-foreground/80">Property Developer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Listings
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Form */}
                <div className="md:col-span-2">
                  <Form
                    fields={profileFields}
                    onSubmit={handleProfileUpdate}
                    schema={profileSchema}
                    submitText={loading ? 'Saving...' : 'Save Changes'}
                    loading={loading}
                    error={error}
                  />
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-4">
                    <h3 className="font-medium mb-4">Profile Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profile Views</span>
                        <span className="font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Connections</span>
                        <span className="font-medium">567</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Listings</span>
                        <span className="font-medium">12</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-4">
                    <h3 className="font-medium mb-4">Verification</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-success">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Identity Verified</span>
                      </div>
                      <div className="flex items-center text-success">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span>Payment Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 bg-card rounded-lg p-4"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="listings">
              <div className="space-y-4">
                {listings.map((listing, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {listing.type}
                        </span>
                        <h3 className="font-medium">{listing.title}</h3>
                      </div>
                      <span className="text-sm bg-success/10 text-success px-2 py-1 rounded">
                        {listing.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{listing.views} views</span>
                      <span>{listing.inquiries} inquiries</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-8">
                {/* Notification Settings */}
                <div className="bg-card rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Notification Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your activity
                        </p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications on your devices
                        </p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-card rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Security Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button>Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-muted-foreground">
                          Update your password regularly
                        </p>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="bg-card rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Account Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive">Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  )
}