'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import {
  UserCheck,
  MapPin,
  Star,
  Award,
  MessageSquare,
  Settings,
  ChevronDown,
  Users,
  Calendar,
  Clock,
  Briefcase,
  Shield,
  TrendingUp,
  DollarSign,
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListingCard } from '@/components/listings/listing-card';
import { useToast } from '@/components/ui/use-toast';

interface ProfileViewProps {
  user: any; // Type this properly based on your Prisma schema
  activity: any[];
  analytics: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  currentUser?: {
    id: string;
    name: string;
    image: string;
  };
}

export const ProfileView = ({
  user,
  activity,
  analytics,
  isOwnProfile,
  isFollowing: initialIsFollowing,
  currentUser,
}: ProfileViewProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/follow', { userId: user.id });
      setIsFollowing(!isFollowing);
      
      toast({
        title: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update follow status. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    router.push(`/messages/new?userId=${user.id}`);
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <div className="container mx-auto py-6">
      {/* Profile Header */}
      <div className="relative h-48 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 mb-20">
        <div className="absolute -bottom-16 left-6 flex items-end space-x-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              {user.name}
              {user.verificationStatus === 'VERIFIED' && (
                <UserCheck className="h-5 w-5 ml-2 text-green-400" />
              )}
            </h1>
            <div className="flex items-center text-white/80">
              <MapPin className="h-4 w-4 mr-1" />
              {user.location}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 right-6 flex space-x-2">
          {!isOwnProfile && (
            <>
              <Button
                variant={isFollowing ? "secondary" : "default"}
                onClick={handleFollow}
                disabled={loading}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button onClick={handleMessage}>
                Message
              </Button>
            </>
          )}
          {isOwnProfile && (
            <Button variant="secondary" onClick={handleSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-xl">{user._count.listings}</CardTitle>
            <CardDescription>Listings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-xl">{user._count.followers}</CardTitle>
            <CardDescription>Followers</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-xl">{user._count.following}</CardTitle>
            <CardDescription>Following</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-xl flex items-center">
              {user.rating.toFixed(1)}
              <Star className="h-4 w-4 ml-1 fill-yellow-400 stroke-yellow-400" />
            </CardTitle>
            <CardDescription>{user._count.reviews} Reviews</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Analytics (if own profile) */}
      {isOwnProfile && analytics && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{analytics.views}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Profile Views</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{analytics.listingViews}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Listing Views</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    £{analytics.totalEarnings._sum.amount?.toLocaleString() || 0}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Total Earnings</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {Math.round((analytics.responseRate[0]?._avg.responseTime || 0) / 60)}m
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Avg. Response Time</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <div className="grid grid-cols-3 gap-6">
            {/* Bio & Expertise */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{user.bio}</p>
                {user.expertise.length > 0 && (
                  <>
                    <h3 className="font-medium mt-4 mb-2">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.expertise.map((exp: string) => (
                        <Badge key={exp} variant="secondary">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Verifications */}
            <Card>
              <CardHeader>
                <CardTitle>Verifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.verifications.map((verification: any) => (
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
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.qualifications.map((qual: any) => (
                    <div
                      key={`${qual.title}-${qual.institution}`}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <h4 className="font-medium">{qual.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {qual.institution}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{qual.year}</p>
                        {qual.verified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.achievements.map((achievement: any) => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-2"
                    >
                      <Award className="h-4 w-4 text-yellow-400" />
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(achievement.unlockedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.listings.map((listing: any) => (
              <ListingCard
                key={listing.id}
                data={listing}
                currentUser={currentUser}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-4">
            {user.reviews.map((review: any) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={review.reviewer.image} />
                        <AvatarFallback>
                          {review.reviewer.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.reviewer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 stroke-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{review.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-4">
            {activity.map((item: any) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.name}{' '}
                        <span className="text-muted-foreground">
                          {item.type.toLowerCase()}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.listing && (
                    <div className="flex items-center space-x-2">
                      <div className="relative h-16 w-16">
                        <Image
                          fill
                          src={item.listing.images[0]}
                          alt={item.listing.title}
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.listing.title}</p>
                      </div>
                    </div>
                  )}
                  {item.post && (
                    <div>
                      <p>{item.post.content}</p>
                      {item.post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {item.post.images.map((image: string) => (
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};