import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

// Create verification session
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Create Stripe Identity verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
      },
      options: {
        document: {
          require_id_number: true,
          require_matching_selfie: true,
          require_live_capture: true,
        },
      },
    })

    // Create verification request record
    await prisma.verificationRequest.create({
      data: {
        userId: session.user.id,
        stripeVerificationId: verificationSession.id,
        status: 'PENDING',
        type: 'IDENTITY',
      },
    })

    return NextResponse.json({
      clientSecret: verificationSession.client_secret,
      verificationUrl: verificationSession.url,
    })

  } catch (error) {
    console.error('[VERIFICATION_SESSION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Stripe webhook handler for verification updates
export async function PUT(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'identity.verification_session.verified') {
      const session = event.data.object as Stripe.Identity.VerificationSession
      const userId = session.metadata.userId

      // Update user verification status
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      })

      // Update verification request status
      await prisma.verificationRequest.update({
        where: {
          stripeVerificationId: session.id,
        },
        data: {
          status: 'VERIFIED',
          completedAt: new Date(),
        },
      })

      // Send real-time notification
      await pusher.trigger(
        `private-user-${userId}`,
        'verification-status',
        {
          status: 'VERIFIED',
          message: 'Your identity has been verified successfully.',
          timestamp: new Date().toISOString(),
        }
      )

      // Create notification record
      await prisma.notification.create({
        data: {
          userId,
          type: 'VERIFICATION',
          title: 'Identity Verification Successful',
          content: 'Your identity has been verified. You can now access all verified user features.',
          metadata: {
            verificationId: session.id,
            verificationType: 'IDENTITY',
          },
        },
      })

      // If user is an agent, enable agent features
      if (user.role === 'AGENT') {
        // Update agent settings
        await prisma.agentProfile.update({
          where: { userId },
          data: {
            isActive: true,
            verificationStatus: 'VERIFIED',
            canReceiveLeads: true,
            canSubmitValuations: true,
          },
        })

        // Notify about agent features
        await pusher.trigger(
          `private-user-${userId}`,
          'agent-status',
          {
            status: 'ACTIVE',
            message: 'Your agent account is now active. You can receive leads and submit valuations.',
            timestamp: new Date().toISOString(),
          }
        )
      }
    }

    return new NextResponse(null, { status: 200 })

  } catch (error) {
    console.error('[VERIFICATION_WEBHOOK_ERROR]', error)
    return new NextResponse('Webhook Error', { status: 400 })
  }
}

// Get verification status
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get latest verification request
    const verificationRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get agent profile if applicable
    const agentProfile = session.user.role === 'AGENT' 
      ? await prisma.agentProfile.findUnique({
          where: { userId: session.user.id },
          select: {
            isActive: true,
            verificationStatus: true,
            canReceiveLeads: true,
            canSubmitValuations: true,
            totalLeads: true,
            successfulLeads: true,
            rating: true,
          },
        })
      : null

    return NextResponse.json({
      isVerified: session.user.isVerified,
      verifiedAt: session.user.verifiedAt,
      verificationStatus: verificationRequest?.status || 'NOT_STARTED',
      lastAttempt: verificationRequest?.createdAt,
      completedAt: verificationRequest?.completedAt,
      agentProfile,
    })

  } catch (error) {
    console.error('[GET_VERIFICATION_STATUS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}