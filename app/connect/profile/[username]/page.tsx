'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Heart,
  Share,
  Bookmark,
  MapPin,
  Mail,
  Globe,
  Briefcase,
  Calendar,
  Users,
  Star,
  Building,
  Award,
  CheckCircle,
  Settings,
  MoreHorizontal,
  Grid,
  List,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Sample user profile data
const userProfile = {
  id: 2,
  name: 'Sarah Wilson',
  username: '@sarahwilson',
  avatar: '/images/users/user-2.jpg',
  coverImage: '/images/cover/cover-1.jpg',
  bio: 'Senior Real Estate Agent | Property Investment Specialist | 10+ years experience in Dublin market',
  verified: true,
  location: 'Dublin, Ireland',
  website: 'www.sarahwilson.com',
  joinDate: '2020-03-15',
  stats: {
    followers: 2345,
    following: 891,
    posts: 156,
  },
  professional: {
    company: 'Dublin Premium Properties',
    position: 'Senior Agent',
    experience: '10+ years',
    specialties: ['Luxury Properties', 'Investment Properties', 'Commercial'],
    certifications: [
      'Licensed Real Estate Agent',
      'Property Investment Advisor',
      'Commercial Property Specialist',
    ],
  },
  achievements: [
    {
      icon: Star,
      title: 'Top Agent 2024',
      description: 'Ranked #1 in Dublin area',
    },
    {
      icon: Award,
      title: '€100M+ Sales',
      description: 'Lifetime sales volume',
    },
    {
      icon: Users,
      title: '500+ Clients',
      description: 'Satisfied customers',
    },
  ],
};

// Sample posts data
const userPosts = [
  {
    id: 1,
    type: 'property',
    content: 'Just listed this stunning penthouse in Dublin 4! 🏢✨ #LuxuryLiving',
    images: ['/images/properties/penthouse-1.jpg'],
    timestamp: '2025-09-04T10:30:00Z',
    likes: 342,
    comments: 45,
    shares: 23,
    property: {
      title: 'Luxury Penthouse',
      location: 'Dublin 4',
      price: '€1,250,000',
      type: 'Penthouse',
      features: ['3 Beds', '3 Baths', '200m²'],
    },
  },
  // Add more posts...
];

// Sample listings data
const userListings = [
  {
    id: 1,
    type: 'sale',
    title: 'Modern City Apartment',
    location: 'Dublin 2',
    price: '€450,000',
    image: '/images/properties/apartment-1.jpg',
    status: 'Active',
    views: 234,
    inquiries: 12,
    posted: '2025-09-01T09:00:00Z',
  },
  // Add more listings...
];

// Sample reviews
const userReviews = [
  {
    id: 1,
    user: {
      name: 'John Murphy',
      avatar: '/images/users/review-1.jpg',
    },
    rating: 5,
    date: '2025-08-28',
    content: 'Sarah was fantastic throughout the entire buying process. Her knowledge of the Dublin market is exceptional.',
    transaction: 'Property Purchase in Dublin 4',
  },
  // Add more reviews...
];

export default function UserProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <Image
          src={userProfile.coverImage}
          alt="Cover"
          fill
          className="object-cover"
        />
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                      {userProfile.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground">{userProfile.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setIsFollowing(!isFollowing)}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Share Profile</DropdownMenuItem>
                        <DropdownMenuItem>Report User</DropdownMenuItem>
                        <DropdownMenuItem>Block User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="mt-4 text-muted-foreground">{userProfile.bio}</p>

                <div className="flex flex-wrap gap-6 mt-4">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Globe className="w-4 h-4 mr-1" />
                    <Link href={`https://${userProfile.website}`} className="hover:text-primary">
                      {userProfile.website}
                    </Link>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {new Date(userProfile.joinDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-6 mt-6">
                  <div>
                    <div className="font-semibold">{userProfile.stats.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <div className="font-semibold">{userProfile.stats.followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <div className="font-semibold">{userProfile.stats.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Professional Information</h2>
            <Badge variant="secondary">{userProfile.professional.position}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{userProfile.professional.company}</div>
                    <div className="text-sm text-muted-foreground">Current Company</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{userProfile.professional.experience}</div>
                    <div className="text-sm text-muted-foreground">Experience</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.professional.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Certifications</h3>
              <div className="space-y-2">
                {userProfile.professional.certifications.map((cert) => (
                  <div key={cert} className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userProfile.achievements.map((achievement) => (
            <Card key={achievement.title} className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <achievement.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'text-primary' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'text-primary' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="posts">
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : ''
            }`}>
              {userPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {post.images?.length > 0 && (
                    <div className="relative aspect-video">
                      <Image
                        src={post.images[0]}
                        alt="Post image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="mb-4">{post.content}</p>
                    {post.property && (
                      <Card className="p-4 mb-4 bg-muted">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{post.property.title}</div>
                          <Badge>{post.property.type}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {post.property.location}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {post.property.features.map((feature) => (
                              <Badge key={feature} variant="outline">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-lg font-semibold text-primary">
                            {post.property.price}
                          </div>
                        </div>
                      </Card>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          <Heart className="w-4 h-4 mr-2" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="w-4 h-4 mr-2" />
                          {post.shares}
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(post.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="space-y-6">
              {userListings.map((listing) => (
                <Card key={listing.id} className="p-6">
                  <div className="flex gap-6">
                    <div className="relative w-48 h-32">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{listing.title}</h3>
                        <Badge>{listing.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {listing.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(listing.posted).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-semibold text-primary">
                          {listing.price}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div>{listing.views} views</div>
                          <div>{listing.inquiries} inquiries</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {userReviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.user.avatar} alt={review.user.name} />
                      <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{review.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.transaction}
                          </div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400"
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.content}</p>
                      <div className="text-sm text-muted-foreground mt-2">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}