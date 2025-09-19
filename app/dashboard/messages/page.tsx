'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare,
  Search,
  Star,
  Phone,
  Video,
  Image as ImageIcon,
  Paperclip,
  Send,
  MoreVertical,
  Archive,
  Trash2,
  Flag,
  Filter,
  Clock,
  CheckCheck,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function MessagesDashboardPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedChat, setSelectedChat] = useState(1)

  // Example messages data
  const messages = {
    all: [
      {
        id: 1,
        user: {
          name: 'Sarah Johnson',
          title: 'Property Developer',
          image: 'https://placehold.co/100',
          online: true,
          verified: true
        },
        lastMessage: {
          text: 'Thanks for the property viewing details. When would be a good time to discuss?',
          time: '10:30 AM',
          unread: true
        },
        type: 'property'
      },
      {
        id: 2,
        user: {
          name: 'Michael Brown',
          title: 'Interior Designer',
          image: 'https://placehold.co/100',
          online: false,
          verified: true
        },
        lastMessage: {
          text: 'I've sent over the design proposals for your review.',
          time: 'Yesterday',
          unread: false
        },
        type: 'service'
      }
    ],
    unread: [
      {
        id: 1,
        user: {
          name: 'Sarah Johnson',
          title: 'Property Developer',
          image: 'https://placehold.co/100',
          online: true,
          verified: true
        },
        lastMessage: {
          text: 'Thanks for the property viewing details. When would be a good time to discuss?',
          time: '10:30 AM',
          unread: true
        },
        type: 'property'
      }
    ],
    archived: [
      {
        id: 3,
        user: {
          name: 'James Wilson',
          title: 'Car Rental Agent',
          image: 'https://placehold.co/100',
          online: false,
          verified: false
        },
        lastMessage: {
          text: 'Your rental booking has been confirmed.',
          time: '2 weeks ago',
          unread: false
        },
        type: 'leisure'
      }
    ]
  }

  // Example chat history
  const chatHistory = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      message: 'Hi! I'm interested in viewing the property on Park Avenue.',
      time: '10:15 AM',
      type: 'received'
    },
    {
      id: 2,
      sender: 'You',
      message: 'Hello Sarah! Of course, I can arrange a viewing. When would you like to see it?',
      time: '10:20 AM',
      type: 'sent'
    },
    {
      id: 3,
      sender: 'Sarah Johnson',
      message: 'Thanks for the property viewing details. When would be a good time to discuss?',
      time: '10:30 AM',
      type: 'received'
    }
  ]

  const stats = [
    {
      name: 'Total Messages',
      value: '248',
      change: '+12 today',
      icon: MessageSquare
    },
    {
      name: 'Response Rate',
      value: '95%',
      change: '+2% this week',
      icon: Clock
    },
    {
      name: 'Avg Response Time',
      value: '15 min',
      change: '-3 min',
      icon: CheckCheck
    },
    {
      name: 'Active Chats',
      value: '12',
      change: '+3 new',
      icon: Users
    }
  ]

  return (
    <PageTransition>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 bg-background border rounded-md"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
            <TabsList className="w-full border-b rounded-none p-0">
              <TabsTrigger
                value="all"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="flex-1 rounded-none border-r data-[state=active]:bg-accent"
              >
                Unread
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex-1 rounded-none data-[state=active]:bg-accent"
              >
                Archived
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-y-auto p-0">
              {messages.all.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full p-4 flex items-start gap-4 hover:bg-accent/50 ${
                    selectedChat === chat.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="relative">
                    <img
                      src={chat.user.image}
                      alt={chat.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                    {chat.user.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium truncate">{chat.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.lastMessage.time}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage.text}
                    </div>
                  </div>
                  {chat.lastMessage.unread && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  )}
                </button>
              ))}
            </TabsContent>

            <TabsContent value="unread" className="flex-1 overflow-y-auto p-0">
              {messages.unread.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full p-4 flex items-start gap-4 hover:bg-accent/50 ${
                    selectedChat === chat.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="relative">
                    <img
                      src={chat.user.image}
                      alt={chat.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                    {chat.user.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium truncate">{chat.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.lastMessage.time}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage.text}
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                </button>
              ))}
            </TabsContent>

            <TabsContent value="archived" className="flex-1 overflow-y-auto p-0">
              {messages.archived.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full p-4 flex items-start gap-4 hover:bg-accent/50 ${
                    selectedChat === chat.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="relative">
                    <img
                      src={chat.user.image}
                      alt={chat.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                    {chat.user.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium truncate">{chat.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.lastMessage.time}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage.text}
                    </div>
                  </div>
                </button>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={messages.all[0].user.image}
                alt={messages.all[0].user.name}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <div className="font-medium">{messages.all[0].user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {messages.all[0].user.title}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'sent' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.type === 'sent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent'
                  }`}
                >
                  <div className="text-sm mb-1">{message.message}</div>
                  <div className="text-xs opacity-70">{message.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-background border rounded-md px-4 py-2"
              />
              <Button>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="w-80 border-l p-4">
          <h3 className="font-semibold mb-4">Statistics</h3>
          <div className="space-y-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-card rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm text-success">
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.name}</div>
                </div>
              )
            })}
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Archive className="h-4 w-4 mr-2" />
                Archive Chat
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}