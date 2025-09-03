import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Property Submission Handler - Core of Landlord Lead Generation System
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { propertyDetails } = body

    if (!propertyDetails || !propertyDetails.location) {
      return new NextResponse('Invalid property details', { status: 400 })
    }

    // Create property submission with 5% commission routing
    const submission = await prisma.propertySubmission.create({
      data: {
        propertyDetails,
        status: 'PENDING',
        commission: 5, // 5% commission for agent routing
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    // Find verified agents in the property's area
    const areaAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isVerified: true,
        // Filter agents by property location area
        // TODO: Implement geo-based filtering using property coordinates
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    // Notify agents via Pusher real-time channels
    for (const agent of areaAgents) {
      await pusher.trigger(`private-user-${agent.id}`, 'new-property-submission', {
        submissionId: submission.id,
        propertyDetails: {
          ...submission.propertyDetails,
          // Exclude sensitive information
          ownerDetails: undefined,
        },
        commission: submission.commission,
        timestamp: new Date().toISOString(),
      })

      // Create notification record
      await prisma.notification.create({
        data: {
          userId: agent.id,
          type: 'PROPERTY_SUBMISSION',
          title: 'New Property Submission',
          content: `New property listing available in ${propertyDetails.location}`,
          metadata: {
            submissionId: submission.id,
            propertyType: propertyDetails.type,
            location: propertyDetails.location,
          },
        }
      })
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        createdAt: submission.createdAt,
        agentCount: areaAgents.length,
      }
    })

  } catch (error) {
    console.error('[PROPERTY_SUBMISSION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get Property Submissions for Agents
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify agent status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== 'AGENT' || !user?.isVerified) {
      return new NextResponse('Unauthorized - Verified agents only', { status: 403 })
    }

    // Get submissions available to the agent
    const submissions = await prisma.propertySubmission.findMany({
      where: {
        status: 'PENDING',
        // Add location/area filtering based on agent's service area
      },
      include: {
        agentInterests: {
          where: {
            userId: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(submissions)

  } catch (error) {
    console.error('[GET_SUBMISSIONS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Express Interest in Property Submission
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { submissionId, message } = body

    // Verify agent status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== 'AGENT' || !user?.isVerified) {
      return new NextResponse('Unauthorized - Verified agents only', { status: 403 })
    }

    // Record agent's interest
    const interest = await prisma.agentInterest.create({
      data: {
        submissionId,
        userId: session.user.id,
        status: 'INTERESTED',
        message,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        submission: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    })

    // Notify property owner via Pusher
    await pusher.trigger(
      `private-user-${interest.submission.user.id}`,
      'agent-interest',
      {
        interestId: interest.id,
        agentName: interest.user.name,
        message: interest.message,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      interest: {
        id: interest.id,
        status: interest.status,
        createdAt: interest.createdAt,
      }
    })

  } catch (error) {
    console.error('[EXPRESS_INTEREST_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}