import { cn } from '@/lib/utils'

// Skeleton Loading Animation
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
      {...props}
    />
  )
}

// Card Loading State
export function CardSkeleton() {
  return (
    <div className="greia-card">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

// Grid Loading State
export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array(count).fill(null).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Search Bar Loading State
export function SearchSkeleton() {
  return (
    <div className="flex items-center bg-white rounded-lg shadow-lg p-2 animate-pulse">
      <div className="flex-1 min-w-0 px-4 py-2">
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-10 w-24 ml-2" />
    </div>
  )
}

// Filter Loading State
export function FiltersSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
        <div className="flex flex-wrap gap-2">
          {Array(4).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

// Page Loading State
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="greia-hero h-[400px] relative">
        <Skeleton className="absolute inset-0" />
        <div className="greia-container relative z-10">
          <div className="greia-hero-content text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
            <div className="max-w-3xl mx-auto">
              <SearchSkeleton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="greia-container py-12">
        <FiltersSkeleton />
        <div className="mb-12">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <GridSkeleton />
        </div>
      </div>
    </div>
  )
}

// Spinner Animation
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Button Loading State
export function ButtonLoading({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      disabled={loading}
      className={cn(
        'greia-button-primary inline-flex items-center justify-center',
        loading && 'opacity-70 cursor-not-allowed'
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Form Loading State
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

// Image Loading State
export function ImageSkeleton({ aspectRatio = "16/9" }: { aspectRatio?: string }) {
  return (
    <div
      className="relative bg-gray-200 dark:bg-gray-800 animate-pulse"
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-300 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
          />
          <circle
            cx="8"
            cy="9"
            r="2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  )
}

// Profile Loading State
export function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

// Navigation Loading State
export function NavigationSkeleton() {
  return (
    <div className="greia-nav">
      <div className="greia-container">
        <div className="flex justify-between items-center h-16">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex items-center space-x-4">
            {Array(4).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

// List Loading State
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array(count).fill(null).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

// Modal Loading State
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}