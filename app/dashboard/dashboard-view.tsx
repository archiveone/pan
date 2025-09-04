'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Home,
  Package,
  Calendar,
  MessageSquare,
  Bell,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
  Clock,
  Plus,
  ChevronRight,
  MapPin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { ListingCard } from '@/components/listings/listing-card';

interface DashboardViewProps {
  user: any;
  recentListings: any[];
  recentBookings: any[];
  recentMessages: any[];
  recentNotifications: any[];
  analytics: any;
  activityFeed: any[];
}

export const DashboardView = ({
  user,
  recentListings,
  recentBookings,
  recentMessages,
  recentNotifications,
  analytics,
  activityFeed,
}: DashboardViewProps) => {
  const router = useRouter();

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find(
      (p: any) => p.user.id !== user.id
    )?.user;
  };

  return (
    <div className="container mx-auto py-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your GREIA account
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => router.push('/listings/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
          <Button variant="outline" onClick={() => router.push('/profile/' + user.id)}>
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.profileViews}</div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Listing Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.listingViews}</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.bookings}</div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                £{analytics.earnings._sum.amount?.toLocaleString() || 0}
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Listings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>
                  Manage and monitor your listings
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/listings/my-listings')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentListings.length > 0 ? (
                  recentListings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden">
                      <div className="relative h-32">
                        <Image
                          fill
                          src={listing.images[0]}
                          alt={listing.title}
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium line-clamp-1">{listing.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary">
                            {listing.category}
                          </Badge>
                          <p className="text-sm font-semibold">
                            £{listing.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{listing._count.views} views</span>
                          <span>{listing._count.favorites} favorites</span>
                          <span>{listing._count.bookings} bookings</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6">
                    <p className="text-muted-foreground mb-2">
                      You don't have any listings yet
                    </p>
                    <Button onClick={() => router.push('/listings/create')}>
                      Create Your First Listing
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Manage your bookings and reservations
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/bookings')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative h-12 w-12">
                          <Image
                            fill
                            src={booking.listing.images[0]}
                            alt={booking.listing.title}
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-1">
                            {booking.listing.title}
                          </h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(booking.startDate), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          £{booking.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            booking.status === 'COMPLETED'
                              ? 'default'
                              : booking.status === 'PENDING'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2">
                    You don't have any bookings yet
                  </p>
                  <Button variant="outline" onClick={() => router.push('/listings')}>
                    Browse Listings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.name}</h2>
                {user.location && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-medium">
                    {analytics.rating._avg.rating?.toFixed(1) || 'No ratings'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full mt-4">
                  <div className="text-center">
                    <p className="font-bold">{user._count.listings}</p>
                    <p className="text-xs text-muted-foreground">Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{user._count.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{user._count.reviews}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex space-x-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/profile/' + user.id)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/settings')}
                  >
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Stay in touch with your connections
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/messages')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    const lastMessage = conversation.messages[0];
                    
                    return (
                      <Link
                        key={conversation.id}
                        href={`/messages/${conversation.id}`}
                        className="flex items-center space-x-3 hover:bg-muted p-2 rounded-md transition"
                      >
                        <Avatar>
                          <AvatarImage src={otherUser.image} />
                          <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{otherUser.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage.content}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">
                    No recent messages
                  </p>
                  <Button variant="outline" onClick={() => router.push('/messages/new')}>
                    Start a Conversation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Stay updated with your account activity
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentNotifications.length > 0 ? (
                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-3 hover:bg-muted p-2 rounded-md transition"
                    >
                      <div className={`p-2 rounded-full bg-primary/10`}>
                        {notification.type === 'MESSAGE' && (
                          <MessageSquare className="h-4 w-4 text-primary" />
                        )}
                        {notification.type === 'BOOKING' && (
                          <Calendar className="h-4 w-4 text-primary" />
                        )}
                        {notification.type === 'SYSTEM' && (
                          <Bell className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No new notifications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Feed */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              Recent activity from you and your network
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {activityFeed.length > 0 ? (
            <div className="space-y-4">
              {activityFeed.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4"
                >
                  <Avatar>
                    <AvatarImage src={activity.user.image} />
                    <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{activity.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type.toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    
                    {activity.listing && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="relative h-12 w-12">
                          <Image
                            fill
                            src={activity.listing.images[0]}
                            alt={activity.listing.title}
                            className="object-cover rounded"
                          />
                        </div>
                        <p className="font-medium">{activity.listing.title}</p>
                      </div>
                    )}
                    
                    {activity.post && (
                      <div className="mt-2">
                        <p>{activity.post.content}</p>
                        {activity.post.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {activity.post.images.map((image: string) => (
                              <div key={image} className="relative aspect-square">
                                <Image
                                  fill
                                  src={image}
                                  alt=""
                                  className="object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No recent activity
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};