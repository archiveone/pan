import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Create verification session with Stripe Identity
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      type, // AGENT, PROFESSIONAL, BUSINESS
      businessDetails, // Optional business registration details
      specializations, // Array of specializations
      areasServed, // Array of service areas
    } = body

    // Check if verification already in progress
    const existingVerification = await prisma.verificationRequest.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
    })

    if (existingVerification) {
      return new NextResponse('Verification already in progress', { status: 400 })
    }

    // Create Stripe verification session with comprehensive requirements
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: session.user.id,
        verificationType: type,
        specializations: specializations?.join(','),
        areasServed: areasServed?.join(','),
      },
      options: {
        document: {
          require_id_number: true,
          require_live_capture: true,
          require_matching_selfie: true,
          allowed_types: ['driving_license', 'passport'],
        },
      },
    })

    // Create verification request with detailed tracking
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: session.user.id,
        type,
        status: 'PENDING',
        stripeVerificationId: verificationSession.id,
        businessDetails: businessDetails || null,
        specializations: specializations || [],
        areasServed: areasServed || [],
        // Track verification initiation
        activities: {
          create: {
            type: 'VERIFICATION_INITIATED',
            userId: session.user.id,
            description: 'Identity verification initiated',
            metadata: {
              verificationType: type,
              stripeSessionId: verificationSession.id,
              specializations,
              areasServed,
            },
          }
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: verificationSession.client_secret,
      url: verificationSession.url,
    })

  } catch (error) {
    console.error('[CREATE_VERIFICATION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Handle Stripe webhook for verification updates
export async function PUT(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'identity.verification_session.verified' ||
        event.type === 'identity.verification_session.requires_input') {
      const session = event.data.object as Stripe.Identity.VerificationSession

      // Get verification request with user details
      const verificationRequest = await prisma.verificationRequest.findFirst({
        where: {
          stripeVerificationId: session.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          },
        },
      })

      if (!verificationRequest) {
        return new NextResponse('Verification request not found', { status: 404 })
      }

      const status = event.type === 'identity.verification_session.verified'
        ? 'VERIFIED'
        : 'REQUIRES_INPUT'

      // Update verification status with activity tracking
      const updatedRequest = await prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: {
          status,
          verifiedAt: status === 'VERIFIED' ? new Date() : null,
          // Track status change
          activities: {
            create: {
              type: 'VERIFICATION_STATUS_UPDATED',
              userId: verificationRequest.userId,
              description: `Verification status updated to ${status}`,
              metadata: {
                oldStatus: verificationRequest.status,
                newStatus: status,
                stripeSessionId: session.id,
              },
            }
          },
        },
      })

      // If verified, update user and create professional profile
      if (status === 'VERIFIED') {
        await prisma.$transaction([
          // Update user verification status
          prisma.user.update({
            where: { id: verificationRequest.userId },
            data: {
              isVerified: true,
              verifiedAt: new Date(),
              role: verificationRequest.type,
            },
          }),
          // Create or update professional profile based on type
          verificationRequest.type === 'AGENT'
            ? prisma.agentProfile.upsert({
                where: { userId: verificationRequest.userId },
                create: {
                  userId: verificationRequest.userId,
                  isActive: true,
                  rating: 0,
                  totalDeals: 0,
                  totalValuations: 0,
                  successRate: 0,
                  specializations: verificationRequest.specializations,
                  areasServed: verificationRequest.areasServed,
                  commissionSettings: {
                    standardRate: 5, // 5% standard commission
                    referralSplit: 20, // 20% referral split
                  },
                },
                update: {
                  isActive: true,
                  specializations: verificationRequest.specializations,
                  areasServed: verificationRequest.areasServed,
                },
              })
            : prisma.professionalProfile.upsert({
                where: { userId: verificationRequest.userId },
                create: {
                  userId: verificationRequest.userId,
                  isActive: true,
                  businessDetails: verificationRequest.businessDetails,
                  rating: 0,
                  totalServices: 0,
                  successRate: 0,
                  specializations: verificationRequest.specializations,
                  areasServed: verificationRequest.areasServed,
                },
                update: {
                  isActive: true,
                  businessDetails: verificationRequest.businessDetails,
                  specializations: verificationRequest.specializations,
                  areasServed: verificationRequest.areasServed,
                },
              }),
        ])

        // Send real-time verification completion notification
        await pusher.trigger(
          `private-user-${verificationRequest.userId}`,
          'verification-complete',
          {
            status: 'VERIFIED',
            type: verificationRequest.type,
            specializations: verificationRequest.specializations,
            areasServed: verificationRequest.areasServed,
            timestamp: new Date().toISOString(),
          }
        )

        // Create verification success notification
        await prisma.notification.create({
          data: {
            userId: verificationRequest.userId,
            type: 'VERIFICATION_COMPLETE',
            title: 'Verification Successful',
            content: `Your ${verificationRequest.type.toLowerCase()} verification is complete. You can now access all features.`,
            metadata: {
              verificationType: verificationRequest.type,
              verificationId: verificationRequest.id,
              specializations: verificationRequest.specializations,
              areasServed: verificationRequest.areasServed,
            },
          },
        })

        // Create welcome post in relevant CRM Groups
        if (verificationRequest.type === 'AGENT') {
          await prisma.post.create({
            data: {
              userId: verificationRequest.userId,
              type: 'WELCOME',
              content: `Welcome ${verificationRequest.user.name}! A new verified agent specializing in ${verificationRequest.specializations.join(', ')} serving ${verificationRequest.areasServed.join(', ')}.`,
              visibility: 'PUBLIC',
              tags: ['new_agent', ...verificationRequest.specializations],
              metadata: {
                verificationType: verificationRequest.type,
                specializations: verificationRequest.specializations,
                areasServed: verificationRequest.areasServed,
              },
            },
          })
        }
      } else {
        // Notify user about required additional input
        await pusher.trigger(
          `private-user-${verificationRequest.userId}`,
          'verification-update',
          {
            status: 'REQUIRES_INPUT',
            type: verificationRequest.type,
            timestamp: new Date().toISOString(),
          }
        )

        await prisma.notification.create({
          data: {
            userId: verificationRequest.userId,
            type: 'VERIFICATION_ACTION_REQUIRED',
            title: 'Verification Action Required',
            content: 'Additional information is needed to complete your verification.',
            metadata: {
              verificationType: verificationRequest.type,
              verificationId: verificationRequest.id,
            },
          },
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[VERIFICATION_WEBHOOK_ERROR]', error)
    return new NextResponse('Webhook Error', { status: 400 })
  }
}

// Get verification status and history
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get verification requests with comprehensive details
    const verificationRequests = await prisma.verificationRequest.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get user verification status with profile details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isVerified: true,
        verifiedAt: true,
        role: true,
        agentProfile: {
          select: {
            isActive: true,
            rating: true,
            totalDeals: true,
            totalValuations: true,
            successRate: true,
            specializations: true,
            areasServed: true,
            commissionSettings: true,
          },
        },
        professionalProfile: {
          select: {
            isActive: true,
            rating: true,
            totalServices: true,
            successRate: true,
            specializations: true,
            areasServed: true,
            businessDetails: true,
          },
        },
      },
    })

    return NextResponse.json({
      verificationRequests,
      userStatus: {
        isVerified: user?.isVerified || false,
        verifiedAt: user?.verifiedAt,
        role: user?.role,
        profile: user?.role === 'AGENT'
          ? user.agentProfile
          : user.professionalProfile,
      },
    })

  } catch (error) {
    console.error('[GET_VERIFICATION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}