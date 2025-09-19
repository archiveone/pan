import * as React from 'react'
import { cn } from '@/lib/utils'
import { Heart, Share2, Shield } from 'lucide-react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string
  title: string
  subtitle?: string
  description?: string
  price?: {
    amount: number
    currency?: string
    unit?: string
  }
  badges?: {
    verified?: boolean
    featured?: boolean
    status?: 'new' | 'popular' | 'sold'
  }
  stats?: Array<{
    icon: React.ElementType
    label: string
    value: string | number
  }>
  actions?: Array<{
    label: string
    icon?: React.ElementType
    onClick?: () => void
    href?: string
    primary?: boolean
  }>
  loading?: boolean
}

export function Card({
  className,
  image,
  title,
  subtitle,
  description,
  price,
  badges,
  stats,
  actions,
  loading,
  ...props
}: CardProps) {
  if (loading) {
    return (
      <div className="greia-card animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-800" />
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 w-1/3" />
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 w-16" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'greia-card group overflow-hidden bg-card text-card-foreground',
        className
      )}
      {...props}
    >
      {/* Card Image */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
              <Heart className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
              <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Badges */}
          {badges && (
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {badges.verified && (
                <div className="bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full flex items-center shadow-md">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Verified
                  </span>
                </div>
              )}
              {badges.featured && (
                <div className="bg-yellow-500 px-3 py-1 rounded-full shadow-md">
                  <span className="text-sm font-medium text-white">
                    Featured
                  </span>
                </div>
              )}
              {badges.status && (
                <div 
                  className={cn(
                    'px-3 py-1 rounded-full shadow-md',
                    {
                      'bg-green-500': badges.status === 'new',
                      'bg-purple-500': badges.status === 'popular',
                      'bg-red-500': badges.status === 'sold',
                    }
                  )}
                >
                  <span className="text-sm font-medium text-white capitalize">
                    {badges.status}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-muted-foreground mb-2">{subtitle}</p>
        )}

        {description && (
          <p className="text-muted-foreground mb-4">{description}</p>
        )}

        {price && (
          <p className="text-2xl font-bold text-primary mb-4">
            {price.currency || '£'}{price.amount.toLocaleString()}
            {price.unit && (
              <span className="text-sm font-normal text-muted-foreground">
                /{price.unit}
              </span>
            )}
          </p>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex items-center space-x-4 text-muted-foreground mb-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="flex items-center">
                  <Icon className="h-4 w-4 mr-1" />
                  <span>{stat.value} {stat.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <div className={cn(
            'grid gap-4',
            actions.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          )}>
            {actions.map((action, index) => {
              const Icon = action.icon
              return action.href ? (
                <a
                  key={index}
                  href={action.href}
                  className={cn(
                    'inline-flex items-center justify-center',
                    action.primary ? 'greia-button-primary' : 'greia-button-secondary'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </a>
              ) : (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={cn(
                    'inline-flex items-center justify-center',
                    action.primary ? 'greia-button-primary' : 'greia-button-secondary'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}