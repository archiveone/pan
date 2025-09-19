'use client'

import * as React from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <DefaultErrorFallback error={this.state.error} />
        )
      )
    }

    return this.props.children
  }
}

// Default Error UI
export function DefaultErrorFallback({ error }: { error?: Error }) {
  const router = useRouter()

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center justify-center"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// API Error Component
export function ApiError({
  status,
  message,
  retry,
}: {
  status: number
  message: string
  retry?: () => void
}) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground p-6">
      <div className="flex items-center gap-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <div>
          <h3 className="font-semibold">Error {status}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {retry && (
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="mt-4"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}

// Form Error Component
export function FormError({
  error,
  className,
}: {
  error: string
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-destructive ${className}`}
    >
      <AlertCircle className="h-4 w-4" />
      {error}
    </div>
  )
}

// Not Found Error
export function NotFound({
  title = 'Page Not Found',
  message = 'The page you are looking for does not exist.',
}: {
  title?: string
  message?: string
}) {
  const router = useRouter()

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button
          onClick={() => router.push('/')}
          className="flex items-center justify-center"
        >
          <Home className="h-4 w-4 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  )
}

// Network Error
export function NetworkError({
  retry,
}: {
  retry?: () => void
}) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Network Error</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to connect to the server. Please check your internet connection.
        </p>
        {retry && (
          <Button
            variant="outline"
            onClick={retry}
            className="flex items-center justify-center mx-auto"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        )}
      </div>
    </div>
  )
}

// Loading Error
export function LoadingError({
  message = 'Failed to load content',
  retry,
}: {
  message?: string
  retry?: () => void
}) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground p-6">
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {retry && (
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="flex items-center justify-center"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

// Inline Error
export function InlineError({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-destructive ${className}`}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}