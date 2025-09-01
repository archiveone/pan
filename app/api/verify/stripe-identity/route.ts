import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Stripe Identity verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_id: session.user.id
      },
      return_url: `${process.env.NEXTAUTH_URL}/dashboard?verification=complete`
    })

    return NextResponse.json({
      client_secret: verificationSession.client_secret,
      url: verificationSession.url
    })
  } catch (error) {
    console.error('Error creating verification session:', error)
    return NextResponse.json({ error: 'Verification session creation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const verificationSession = await stripe.identity.verificationSessions.retrieve(sessionId)

    if (verificationSession.status === 'verified') {
      // Update user verification status
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          stripeIdentityVerified: true,
          passportVerified: true
        }
      })
    }

    return NextResponse.json({
      status: verificationSession.status,
      verified: verificationSession.status === 'verified'
    })
  } catch (error) {
    console.error('Error checking verification status:', error)
    return NextResponse.json({ error: 'Verification check failed' }, { status: 500 })
  }
}
