'use client'

import { useState } from 'react'
import { Form } from '@/components/ui/form'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Github, Mail } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional()
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      validation: {
        required: 'Email is required'
      }
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      validation: {
        required: 'Password is required'
      }
    },
    {
      name: 'remember',
      label: 'Remember me',
      type: 'checkbox',
      description: 'Stay signed in for 30 days'
    }
  ]

  const handleSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true)
    setError('')

    try {
      // Handle login logic here
      console.log('Login data:', data)
    } catch (err) {
      setError('Invalid email or password')
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {}}
            >
              <Github className="h-5 w-5 mr-2" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {}}
            >
              <Mail className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Login Form */}
          <Form
            fields={fields}
            onSubmit={handleSubmit}
            schema={loginSchema}
            submitText={loading ? 'Signing in...' : 'Sign in'}
            loading={loading}
            error={error}
          />

          {/* Forgot Password */}
          <div className="text-sm text-center">
            <Link
              href="/forgot-password"
              className="text-primary hover:text-primary/90"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link
              href="/legal/terms"
              className="underline hover:text-foreground"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/legal/privacy"
              className="underline hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}