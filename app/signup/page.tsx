'use client'

import { useState } from 'react'
import { Form } from '@/components/ui/form'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Github, Mail, Building2, User } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  accountType: z.enum(['personal', 'business']),
  terms: z.boolean().refine(val => val, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal')

  const fields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      validation: {
        required: 'Name is required'
      }
    },
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
      placeholder: 'Create a password',
      validation: {
        required: 'Password is required'
      }
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your password',
      validation: {
        required: 'Please confirm your password'
      }
    },
    {
      name: 'terms',
      label: 'Terms and Conditions',
      type: 'checkbox',
      description: 'I agree to the Terms of Service and Privacy Policy',
      validation: {
        required: 'You must accept the terms and conditions'
      }
    }
  ]

  const handleSubmit = async (data: z.infer<typeof signupSchema>) => {
    setLoading(true)
    setError('')

    try {
      // Handle signup logic here
      console.log('Signup data:', { ...data, accountType })
    } catch (err) {
      setError('An error occurred during signup')
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Account Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={accountType === 'personal' ? 'default' : 'outline'}
              className="flex flex-col items-center py-4"
              onClick={() => setAccountType('personal')}
            >
              <User className="h-6 w-6 mb-2" />
              <span>Personal</span>
              <span className="text-xs text-muted-foreground mt-1">
                For individual use
              </span>
            </Button>
            <Button
              variant={accountType === 'business' ? 'default' : 'outline'}
              className="flex flex-col items-center py-4"
              onClick={() => setAccountType('business')}
            >
              <Building2 className="h-6 w-6 mb-2" />
              <span>Business</span>
              <span className="text-xs text-muted-foreground mt-1">
                For companies
              </span>
            </Button>
          </div>

          {/* Social Signup */}
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

          {/* Signup Form */}
          <Form
            fields={fields}
            onSubmit={handleSubmit}
            schema={signupSchema}
            submitText={loading ? 'Creating account...' : 'Create account'}
            loading={loading}
            error={error}
          />

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By creating an account, you agree to our{' '}
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