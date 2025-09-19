'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Plus,
  Search,
  Star,
  MessageSquare,
  Building2,
  UserPlus,
  Mail,
  Edit,
  ArrowUpDown,
  Filter,
  Download,
  Share2,
  Globe,
  Briefcase,
  Award,
  UserCheck,
  Bell
} from 'lucide-react'
import Link from 'next/link'

export default function NetworkDashboardPage() {
  const [selectedTab, setSelectedTab] = useState('connections')

  // Example network data
  const network = {
    connections: [
      {
        id: 1,
        name: 'Sarah Johnson',
        title: 'Property Developer',
        company: 'Modern Homes Ltd',
        location: 'London, UK',
        image: 'https://placehold.co/100',
        verified: true,
        stats: {
          mutualConnections: 45,
          endorsements: 28,
          rating: 4.9
        },
        lastInteraction: '2 days ago'
      },
      {
        id: 2,
        name: 'Michael Brown',
        title: 'Interior Designer',
        company: 'Design Studio',
        location: 'London, UK',
        image: 'https://placehold.co/100',
        verified: true,
        stats: {
          mutualConnections: 32,
          endorsements: 19,
          rating: 4.8
        },
        lastInteraction: '1 week ago'
      }
    ],
    pending: [
      {
        id: 3,
        name: 'James Wilson',
        title: 'Real Estate Agent',
        company: 'Prime Properties',
        location: 'London, UK',
        image: 'https://placehold.co/100',
        stats: {
          mutualConnections: 15,
          endorsements: 12
        },
        requestedAt: '3 days ago'
      }
    ],
    groups: [
      {
        id: 1,
        name: 'London Property Professionals',
        members: 1245,
        category: 'Real Estate',
        image: 'https://placehold.co/100',
        role: 'Admin',
        activity: {
          posts: 156,
          discussions: 45
        },
        lastActive: '2 hours ago'
      },
      {
        id: 2,
        name: 'Luxury Rentals Network',
        members: 856,
        category: 'Leisure',
        image: 'https://placehold.co/100',
        role: 'Member',
        activity: {
          posts: 89,
          discussions: 23
        },
        lastActive: '1 day ago'
      }
    ]
  }

  const stats = [
    {
      name: 'Total Connections',
      value: '458',
      change: '+45 this month',
      icon: Users
    },
    {
      name: 'Profile Views',
      value: '1,245',
      change: '+12% this week',
      icon: Eye
    },
    {
      name: 'Endorsements',
      value: '89',
      change: '+8 this month',
      icon: Star
    },
    {
      name: 'Group Memberships',
      value: '12',
      change: '+2 this week',
      icon: Globe
    }
  ]

  const categories = [
    { name: 'Real Estate', icon: Building2 },
    { name: 'Services', icon: Briefcase },
    { name: 'Leisure', icon: Car },
    { name: 'Investors', icon: DollarSign },
    { name: 'Professionals', icon: Users }
  ]

  return (
    <PageTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Network</h1>
            <p className="text-muted-foreground">
              Manage your professional connections
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-card rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm text-success">
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.name}</div>
              </div>
            )
          })}
        </div>

        {/* Category Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center"
              >
                <Icon className="h-6 w-6 mb-2" />
                <span>{category.name}</span>
              </Button>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search network..."
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-md"
            />
          </div>
          <Button variant="outline">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Network Content */}
        <div className="bg-card rounded-lg">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full border-b rounded-none p-0">
              <TabsTrigger
                value="connections"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Connections ({network.connections.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Pending ({network.pending.length})
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="flex-1 rounded-none data-[state=active]:bg-accent"
              >
                Groups ({network.groups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="p-6">
              <div className="space-y-4">
                {network.connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={connection.image}
                      alt={connection.name}
                      className="h-16 w-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{connection.name}</h3>
                        {connection.verified && (
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded flex items-center">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {connection.title} at {connection.company}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {connection.location}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{connection.stats.mutualConnections} mutual connections</span>
                        <span>{connection.stats.endorsements} endorsements</span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {connection.stats.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="p-6">
              <div className="space-y-4">
                {network.pending.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={request.image}
                      alt={request.name}
                      className="h-16 w-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{request.name}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {request.title} at {request.company}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.location}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{request.stats.mutualConnections} mutual connections</span>
                        <span>{request.stats.endorsements} endorsements</span>
                        <span>Requested {request.requestedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button>Accept</Button>
                      <Button variant="outline">Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="p-6">
              <div className="space-y-4">
                {network.groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-6 p-4 bg-accent/50 rounded-lg"
                  >
                    <img
                      src={group.image}
                      alt={group.name}
                      className="h-16 w-16 rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{group.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {group.role}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {group.category} • {group.members} members
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{group.activity.posts} posts</span>
                        <span>{group.activity.discussions} discussions</span>
                        <span>Last active {group.lastActive}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        View Group
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Bell className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <UserPlus className="h-6 w-6 mb-2" />
            <span className="font-medium">Import Contacts</span>
            <span className="text-sm text-muted-foreground mt-1">
              Connect with your network
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <Globe className="h-6 w-6 mb-2" />
            <span className="font-medium">Create Group</span>
            <span className="text-sm text-muted-foreground mt-1">
              Start a professional community
            </span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center text-center">
            <Award className="h-6 w-6 mb-2" />
            <span className="font-medium">Get Verified</span>
            <span className="text-sm text-muted-foreground mt-1">
              Enhance your professional profile
            </span>
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}