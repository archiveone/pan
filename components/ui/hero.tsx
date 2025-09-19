'use client'

import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

interface HeroProps {
  title: string
  subtitle?: string
  image: string
  height?: string
  search?: {
    enabled: boolean
    placeholder?: string
    onSearch?: (value: string) => void
  }
  overlay?: boolean
  overlayOpacity?: number
  className?: string
  children?: React.ReactNode
}

export function Hero({
  title,
  subtitle,
  image,
  height = 'h-[400px]',
  search,
  overlay = true,
  overlayOpacity = 50,
  className,
  children,
}: HeroProps) {
  return (
    <section className={cn('greia-hero relative', height, className)}>
      {/* Background Image */}
      <div className="greia-hero-image absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      {overlay && (
        <div 
          className="greia-hero-overlay absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      {/* Content */}
      <div className="greia-container relative z-10">
        <div className="greia-hero-content text-center">
          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-4 text-xl text-gray-200">
              {subtitle}
            </p>
          )}

          {/* Search Bar */}
          {search?.enabled && (
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
                <div className="flex-1 min-w-0 px-4 py-2">
                  <input
                    type="text"
                    className="w-full border-0 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-transparent text-lg"
                    placeholder={search.placeholder || "Search..."}
                    onChange={(e) => search.onSearch?.(e.target.value)}
                  />
                </div>
                <button className="greia-button-primary ml-2">
                  <Search className="h-5 w-5" />
                  <span className="ml-2">Search</span>
                </button>
              </div>
            </div>
          )}

          {/* Additional Content */}
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Loading State
export function HeroSkeleton({
  height = 'h-[400px]',
  className,
}: {
  height?: string
  className?: string
}) {
  return (
    <section className={cn('greia-hero relative animate-pulse', height, className)}>
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800" />
      <div className="greia-container relative z-10">
        <div className="greia-hero-content text-center">
          <div className="h-12 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
          <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-8" />
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-gray-300 dark:bg-gray-700 rounded-lg p-2">
              <div className="flex-1 h-10 mx-4" />
              <div className="h-10 w-24 bg-gray-400 dark:bg-gray-600 rounded-lg ml-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Variants
export function PropertyHero(props: Omit<HeroProps, 'image'>) {
  return (
    <Hero
      image="/my-home-worldwide.png"
      search={{
        enabled: true,
        placeholder: "Search by location, property type, or keywords"
      }}
      {...props}
    />
  )
}

export function ServiceHero(props: Omit<HeroProps, 'image'>) {
  return (
    <Hero
      image="/services.png"
      search={{
        enabled: true,
        placeholder: "Search for services or providers"
      }}
      {...props}
    />
  )
}

export function LeisureHero(props: Omit<HeroProps, 'image'>) {
  return (
    <Hero
      image="/connect.png"
      search={{
        enabled: true,
        placeholder: "Search for activities, rentals, or venues"
      }}
      {...props}
    />
  )
}

export function ConnectHero(props: Omit<HeroProps, 'image'>) {
  return (
    <Hero
      image="/connect.png"
      search={{
        enabled: true,
        placeholder: "Search for professionals, companies, or groups"
      }}
      {...props}
    />
  )
}