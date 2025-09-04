'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { format } from 'date-fns';
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Briefcase,
  MapPin,
  Award,
  Trash,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/components/ui/use-toast';

// Profile schema
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  image: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  expertise: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
});

// Security schema
const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Notification schema
const notificationSchema = z.object({
  email: z.object({
    marketing: z.boolean().default(false),
    account: z.boolean().default(true),
    messages: z.boolean().default(true),
    bookings: z.boolean().default(true),
  }),
  push: z.object({
    marketing: z.boolean().default(false),
    account: z.boolean().default(true),
    messages: z.boolean().default(true),
    bookings: z.boolean().default(true),
  }),
});

// Privacy schema
const privacySchema = z.object({
  profileVisibility: z.enum(['PUBLIC', 'PRIVATE', 'CONNECTIONS']),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  allowMessaging: z.boolean().default(true),
  showActivity: z.boolean().default(true),
});

interface SettingsViewProps {
  user: any; // Type this properly based on your Prisma schema
  billingHistory: any[];
}

export const SettingsView = ({
  user,
  billingHistory,
}: SettingsViewProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || '',
      expertise: user.expertise || [],
      serviceAreas: user.serviceAreas || [],
    },
  });

  // Security form
  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Notification form
  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email: {
        marketing: user.notificationPreferences?.email?.marketing || false,
        account: user.notificationPreferences?.email?.account || true,
        messages: user.notificationPreferences?.email?.messages || true,
        bookings: user.notificationPreferences?.email?.bookings || true,
      },
      push: {
        marketing: user.notificationPreferences?.push?.marketing || false,
        account: user.notificationPreferences?.push?.account || true,
        messages: user.notificationPreferences?.push?.messages || true,
        bookings: user.notificationPreferences?.push?.bookings || true,
      },
    },
  });

  // Privacy form
  const privacyForm = useForm<z.infer<typeof privacySchema>>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: user.privacySettings?.profileVisibility || 'PUBLIC',
      showEmail: user.privacySettings?.showEmail || false,
      showPhone: user.privacySettings?.showPhone || false,
      allowMessaging: user.privacySettings?.allowMessaging || true,
      showActivity: user.privacySettings?.showActivity || true,
    },
  });

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setLoading(true);
      await axios.patch('/api/users/profile', data);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      
      router.refresh();
    } catch (error) {
      console.error('[PROFILE_UPDATE]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSecuritySubmit = async (data: z.infer<typeof securitySchema>) => {
    try {
      setLoading(true);
      await axios.patch('/api/users/security', data);
      
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      
      securityForm.reset();
    } catch (error) {
      console.error('[SECURITY_UPDATE]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update password. Please check your current password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onNotificationSubmit = async (data: z.infer<typeof notificationSchema>) => {
    try {
      setLoading(true);
      await axios.patch('/api/users/notifications', data);
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully',
      });
      
      router.refresh();
    } catch (error) {
      console.error('[NOTIFICATION_UPDATE]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update notification preferences. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPrivacySubmit = async (data: z.infer<typeof privacySchema>) => {
    try {
      setLoading(true);
      await axios.patch('/api/users/privacy', data);
      
      toast({
        title: 'Success',
        description: 'Privacy settings updated successfully',
      });
      
      router.refresh();
    } catch (error) {
      console.error('[PRIVACY_UPDATE]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update privacy settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = () => {
    router.push('/settings/payment-methods/new');
  };

  const addBankAccount = () => {
    router.push('/settings/bank-accounts/new');
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/payment-methods/${id}`);
      
      toast({
        title: 'Success',
        description: 'Payment method deleted successfully',
      });
      
      router.refresh();
    } catch (error) {
      console.error('[PAYMENT_METHOD_DELETE]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete payment method. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBankAccount = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/bank-accounts/${id}`);
      
      toast({
        title: 'Success',
        description: 'Bank account deleted successfully',
      });
      
      router.refresh();
    } catch (error) {
      console.error('[BANK_ACCOUNT_DELETE]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete bank account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (id: string) => {
    try {
      setLoading(true);
      await axios.post(`/api/subscriptions/${id}/cancel`);
      
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });
      
      router.refresh();
    } catch (error) {
      console.error('[SUBSCRIPTION_CANCEL]', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not cancel subscription. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <FormField
                      control={profileForm.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload
                              value={field.value ? [field.value] : []}
                              onChange={(url) => field.onChange(url[0])}
                              onRemove={() => field.onChange('')}
                              disabled={loading}
                              maxFiles={1}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a clear photo of yourself
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={loading}
                            placeholder="Tell us about yourself"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={loading}
                              placeholder="City, Country"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={loading}
                              placeholder="+44 123 456 7890"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={loading}
                            placeholder="https://example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Add your expertise and service areas to help clients find you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise?.map((exp: string) => (
                      <Badge key={exp} variant="secondary">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Service Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.serviceAreas?.map((area: string) => (
                      <Badge key={area} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Qualifications</h3>
                  <div className="space-y-2">
                    {user.qualifications?.map((qual: any) => (
                      <div
                        key={`${qual.title}-${qual.institution}`}
                        className="flex items-start justify-between"
                      >
                        <div>
                          <p className="font-medium">{qual.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {qual.institution}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{qual.year}</p>
                          {qual.verified && (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={() => router.push('/settings/professional')}>
                  Edit Professional Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Verification</CardTitle>
              <CardDescription>
                Verify your identity to unlock additional features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.verifications?.map((verification: any) => (
                  <div
                    key={verification.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>{verification.type}</span>
                    </div>
                    <Badge
                      variant={verification.status === 'VERIFIED' ? 'default' : 'secondary'}
                    >
                      {verification.status}
                    </Badge>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => router.push('/settings/verification')}
                >
                  Manage Verifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="email.marketing"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Marketing</FormLabel>
                              <FormDescription>
                                Receive emails about new features and offers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="email.account"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Account</FormLabel>
                              <FormDescription>
                                Receive emails about your account activity
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="email.messages"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Messages</FormLabel>
                              <FormDescription>
                                Receive emails when you get new messages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="email.bookings"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Bookings</FormLabel>
                              <FormDescription>
                                Receive emails about your bookings and inquiries
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="push.marketing"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Marketing</FormLabel>
                              <FormDescription>
                                Receive push notifications about new features and offers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="push.account"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Account</FormLabel>
                              <FormDescription>
                                Receive push notifications about your account activity
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="push.messages"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Messages</FormLabel>
                              <FormDescription>
                                Receive push notifications when you get new messages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="push.bookings"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Bookings</FormLabel>
                              <FormDescription>
                                Receive push notifications about your bookings and inquiries
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information and how it's used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...privacyForm}>
                <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-6">
                  <FormField
                    control={privacyForm.control}
                    name="profileVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PUBLIC">Public</SelectItem>
                            <SelectItem value="CONNECTIONS">Connections Only</SelectItem>
                            <SelectItem value="PRIVATE">Private</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Control who can see your profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="showEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Email</FormLabel>
                          <FormDescription>
                            Allow others to see your email address
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="showPhone"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Phone</FormLabel>
                          <FormDescription>
                            Allow others to see your phone number
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="allowMessaging"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Allow Messaging</FormLabel>
                          <FormDescription>
                            Allow others to send you messages
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="showActivity"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Activity</FormLabel>
                          <FormDescription>
                            Show your activity on your profile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Privacy Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.paymentMethods?.map((method: any) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <div>
                          <p className="font-medium">
                            {method.type} •••• {method.lastFour}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.expiryDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePaymentMethod(method.id)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addPaymentMethod}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>
                  Manage your bank accounts for payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.bankAccounts?.map((account: any) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <div>
                          <p className="font-medium">
                            {account.accountName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            •••• {account.lastFour}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {account.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBankAccount(account.id)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addBankAccount}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>
                  Manage your subscriptions and plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.subscriptions?.length > 0 ? (
                    user.subscriptions.map((subscription: any) => (
                      <div
                        key={subscription.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{subscription.plan}</p>
                          <p className="text-sm text-muted-foreground">
                            £{subscription.amount} / month
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Next billing: {format(new Date(subscription.nextBillingDate), 'PPP')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => cancelSubscription(subscription.id)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No active subscriptions</p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => router.push('/pricing')}
                      >
                        View Plans
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View your recent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.length > 0 ? (
                    billingHistory.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.createdAt), 'PPP')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{payment.amount}</p>
                          <Badge
                            variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No billing history</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};