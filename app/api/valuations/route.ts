import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create Valuation Request
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

    // Create valuation request
    const request = await prisma.valuationRequest.create({
      data: {
        propertyDetails,
        status: 'PENDING',
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

    // Find verified agents in the area
    const areaAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isVerified: true,
        // TODO: Add location-based filtering
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    // Notify agents via Pusher
    for (const agent of areaAgents) {
      await pusher.trigger(`private-user-${agent.id}`, 'new-valuation-request', {
        requestId: request.id,
        propertyDetails: {
          ...request.propertyDetails,
          // Exclude sensitive information
          ownerDetails: undefined,
        },
        timestamp: new Date().toISOString(),
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: agent.id,
          type: 'VALUATION_REQUEST',
          title: 'New Valuation Request',
          content: `New valuation request for property in ${propertyDetails.location}`,
          metadata: {
            requestId: request.id,
            propertyType: propertyDetails.type,
            location: propertyDetails.location,
          },
        }
      })
    }

    return NextResponse.json({
      success: true,
      request: {
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
        agentCount: areaAgents.length,
      }
    })

  } catch (error) {
    console.error('[VALUATION_REQUEST_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Submit Valuation Offer (Agents)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { requestId, amount, message } = body

    // Verify agent status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== 'AGENT' || !user?.isVerified) {
      return new NextResponse('Unauthorized - Verified agents only', { status: 403 })
    }

    // Create valuation offer
    const offer = await prisma.valuationOffer.create({
      data: {
        requestId,
        userId: session.user.id,
        amount,
        message,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        request: {
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
      `private-user-${offer.request.user.id}`,
      'valuation-offer',
      {
        offerId: offer.id,
        agentName: offer.user.name,
        amount: offer.amount,
        message: offer.message,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        status: offer.status,
        amount: offer.amount,
        createdAt: offer.createdAt,
      }
    })

  } catch (error) {
    console.error('[VALUATION_OFFER_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get Valuation Requests (Agents)
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

    // Get valuation requests
    const requests = await prisma.valuationRequest.findMany({
      where: {
        status: 'PENDING',
        // Add location/area filtering
      },
      include: {
        offers: {
          where: {
            userId: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(requests)

  } catch (error) {
    console.error('[GET_VALUATION_REQUESTS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}