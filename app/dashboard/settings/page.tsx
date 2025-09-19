'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  X,
  LogOut,
  Trash2
} from 'lucide-react'

export default function SettingsDashboardPage() {
  const [selectedTab, setSelectedTab] = useState('profile')

  // Example user data
  const user = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+44 7700 900000',
    avatar: 'https://placehold.co/200',
    role: 'Premium Account',
    verificationStatus: 'Verified',
    twoFactorEnabled: true,
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'Public',
      showEmail: false,
      showPhone: false
    },
    billing: {
      plan: 'Premium',
      nextBilling: 'October 1, 2025',
      amount: '£29.99',
      paymentMethod: {
        type: 'Credit Card',
        last4: '4242',
        expiry: '12/26'
      }
    }
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="space-y-6">
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto space-y-1">
                <TabsTrigger
                  value="profile"
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="justify-start"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className="justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="justify-start"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Account Actions */}
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">Account Actions</h3>
              <Button variant="outline" className="w-full justify-start text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                <div className="flex items-start gap-6">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-lg"
                  />
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full mt-1 p-2 rounded-md border bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full mt-1 p-2 rounded-md border bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <input
                        type="tel"
                        value={user.phone}
                        className="w-full mt-1 p-2 rounded-md border bg-background"
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates and alerts via email
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {user.notifications.email ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      {user.notifications.email ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications on your device
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {user.notifications.push ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      {user.notifications.push ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SMS Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive important updates via SMS
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {user.notifications.sms ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      {user.notifications.sms ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </div>
                      </div>
                      <Button variant="outline">
                        {user.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    {user.twoFactorEnabled && (
                      <div className="bg-accent/50 rounded-lg p-4">
                        <div className="text-sm">
                          Two-factor authentication is currently enabled. You'll need to enter a code from your authenticator app when signing in.
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium mb-2">Change Password</div>
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full p-2 rounded-md border bg-background"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full p-2 rounded-md border bg-background"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full p-2 rounded-md border bg-background"
                      />
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Billing Information</h2>
                <div className="space-y-6">
                  <div className="bg-accent/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{user.billing.plan} Plan</div>
                      <Button variant="outline" size="sm">Change Plan</Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Next billing date: {user.billing.nextBilling}
                      <br />
                      Amount: {user.billing.amount}/month
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-4">Payment Method</div>
                    <div className="flex items-center justify-between bg-accent/50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-3" />
                        <div>
                          <div className="text-sm font-medium">
                            {user.billing.paymentMethod.type} ending in {user.billing.paymentMethod.last4}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Expires {user.billing.paymentMethod.expiry}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Profile Visibility</div>
                      <div className="text-sm text-muted-foreground">
                        Control who can see your profile
                      </div>
                    </div>
                    <Button variant="outline">
                      <Globe className="h-4 w-4 mr-2" />
                      {user.privacy.profileVisibility}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show Email Address</div>
                      <div className="text-sm text-muted-foreground">
                        Display your email on your profile
                      </div>
                    </div>
                    <Button variant="outline">
                      {user.privacy.showEmail ? (
                        <Eye className="h-4 w-4 mr-2" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-2" />
                      )}
                      {user.privacy.showEmail ? 'Visible' : 'Hidden'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show Phone Number</div>
                      <div className="text-sm text-muted-foreground">
                        Display your phone number on your profile
                      </div>
                    </div>
                    <Button variant="outline">
                      {user.privacy.showPhone ? (
                        <Eye className="h-4 w-4 mr-2" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-2" />
                      )}
                      {user.privacy.showPhone ? 'Visible' : 'Hidden'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}