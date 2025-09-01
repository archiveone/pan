'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface VerificationProps {
  user: {
    passportVerified: boolean
    stripeIdentityVerified: boolean
    isLicensedAgent: boolean
  }
}

export default function StripeVerification({ user }: VerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)

  const startVerification = async () => {
    setIsVerifying(true)

    try {
      const response = await fetch('/api/verify/stripe-identity', {
        method: 'POST'
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        toast.error('Failed to start verification')
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Verification failed to start')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Identity Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Passport Verification</span>
            {user.passportVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Stripe Identity Check</span>
            {user.stripeIdentityVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Real Estate License</span>
            {user.isLicensedAgent ? (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Licensed Agent
              </Badge>
            ) : (
              <Badge variant="outline">
                Not Licensed
              </Badge>
            )}
          </div>
        </div>

        {!user.passportVerified && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-4">
              Complete identity verification to access all platform features. This includes passport verification through Stripe Identity.
            </p>
            <Button
              onClick={startVerification}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Starting verification...' : 'Start Identity Verification'}
            </Button>
          </div>
        )}

        {user.passportVerified && !user.isLicensedAgent && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-4">
              To list residential properties for sale or rent, you need a real estate license. Upload your license document to become a verified agent.
            </p>
            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Real Estate License
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
