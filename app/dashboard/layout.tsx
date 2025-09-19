'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Building2,
  Wrench,
  Car,
  Users,
  MessageSquare,
  Calendar,
  Heart,
  Settings,
  CreditCard,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Properties',
    href: '/dashboard/properties',
    icon: Building2
  },
  {
    name: 'Services',
    href: '/dashboard/services',
    icon: Wrench
  },
  {
    name: 'Leisure',
    href: '/dashboard/leisure',
    icon: Car
  },
  {
    name: 'Network',
    href: '/dashboard/network',
    icon: Users
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar
  },
  {
    name: 'Saved Items',
    href: '/dashboard/saved',
    icon: Heart
  }
]

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard
  }
]

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link href="/">
            <img
              src="/greia-logo.png"
              alt="GREIA"
              className="h-8 dark:invert"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="px-2 py-4 border-t">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">John Smith</p>
                <p className="text-xs text-muted-foreground">
                  Premium Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        {/* Top Bar */}
        <div className="h-16 border-b bg-card flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}