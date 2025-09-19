'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'
import {
  Bell,
  MessageSquare,
  User,
  Menu,
  X,
  Home,
  Briefcase,
  Coffee,
  Users,
  LogIn
} from 'lucide-react'
import { useState } from 'react'

export default function MainNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const mainNavItems = [
    {
      name: 'Properties',
      href: '/properties',
      icon: Home,
    },
    {
      name: 'Services',
      href: '/services',
      icon: Briefcase,
    },
    {
      name: 'Leisure',
      href: '/leisure',
      icon: Coffee,
    },
    {
      name: 'Connect',
      href: '/connect',
      icon: Users,
    },
  ]

  return (
    <nav className="w-full">
      <div className="greia-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <img
                className="h-8 w-auto"
                src="/images/greia-logo.png"
                alt="GREIA"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'greia-nav-link inline-flex items-center space-x-2',
                    pathname === item.href && 'greia-nav-link-active'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/messages" className="greia-nav-link">
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link href="/notifications" className="greia-nav-link">
                  <Bell className="h-5 w-5" />
                </Link>
                <Link 
                  href="/dashboard"
                  className="greia-button-primary"
                >
                  Dashboard
                </Link>
                <Link href="/profile" className="greia-nav-link">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Profile'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin"
                  className="greia-button-secondary"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="greia-button-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'greia-nav-link block py-2 px-3 rounded-md text-base font-medium',
                    pathname === item.href && 'greia-nav-link-active'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="block w-full text-center py-2 px-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block w-full text-center py-2 px-3 rounded-md text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center py-2 px-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}