'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: '/properties',
      label: 'Properties',
      active: pathname === '/properties',
    },
    {
      href: '/services',
      label: 'Services',
      active: pathname === '/services',
    },
    {
      href: '/leisure',
      label: 'Leisure',
      active: pathname === '/leisure',
    },
    {
      href: '/connect',
      label: 'Connect',
      active: pathname === '/connect',
    },
  ]

  return (
    <nav className="flex items-center space-x-6">
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold">GREIA</span>
      </Link>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-black dark:text-white' : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}