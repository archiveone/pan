'use client'

import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: '📊',
    },
    {
      name: 'Properties',
      href: '/dashboard/properties',
      icon: '🏠',
    },
    {
      name: 'Services',
      href: '/dashboard/services',
      icon: '🛠',
    },
    {
      name: 'Leisure',
      href: '/dashboard/leisure',
      icon: '🎉',
    },
    {
      name: 'CRM',
      href: '/dashboard/crm',
      icon: '👥',
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: '💬',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: '⚙️',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold">
                  GREIA
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative">
                  <button className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <span>{user?.name}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-[calc(100vh-4rem)] border-r">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}