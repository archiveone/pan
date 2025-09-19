'use client'

import { useState } from 'react'
import { Form } from '@/components/ui/form'
import { PageTransition } from '@/components/ui/page-transition'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      validation: {
        required: 'Email is required'
      }
    }
  ]

  const handleSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Handle password reset logic here
      console.log('Reset password for:', data.email)
      setSuccess(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <Link href="/">
              <img
                src="/greia-logo.png"
                alt="GREIA"
                className="h-12 dark:invert"
              />
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-center">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="bg-success/10 text-success p-4 rounded-lg text-center">
              <p className="font-medium">Check your email</p>
              <p className="text-sm mt-1">
                We've sent you a link to reset your password. The link will expire in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:text-primary/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              {/* Reset Form */}
              <Form
                fields={fields}
                onSubmit={handleSubmit}
                schema={forgotPasswordSchema}
                submitText={loading ? 'Sending link...' : 'Send reset link'}
                loading={loading}
                error={error}
              />

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/90"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Link>
              </div>
            </>
          )}

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            If you're having trouble, please contact{' '}
            <Link
              href="/support"
              className="text-primary hover:text-primary/90"
            >
              support
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}