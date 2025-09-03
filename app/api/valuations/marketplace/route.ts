import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create valuation request with agent matching
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      propertyDetails,
      location,
      propertyType, // RESIDENTIAL, COMMERCIAL, LAND
      propertySubType, // HOUSE, FLAT, OFFICE, etc.
      bedrooms,
      bathrooms,
      totalArea,
      landArea,
      features,
      condition,
      urgency, // ASAP, WITHIN_WEEK, WITHIN_MONTH
      preferredContactMethod, // EMAIL, PHONE, IN_PERSON
      additionalNotes,
      expectedValue, // Optional - owner's expected value
    } = body

    // Create valuation request with detailed tracking
    const request = await prisma.valuationRequest.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        propertyDetails: {
          location,
          propertyType,
          propertySubType,
          bedrooms,
          bathrooms,
          totalArea,
          landArea,
          features,
          condition,
          expectedValue,
        },
        urgency,
        preferredContactMethod,
        notes: additionalNotes,
        // Track request creation
        activities: {
          create: {
            type: 'REQUEST_CREATED',
            description: 'Valuation request created',
            userId: session.user.id,
            metadata: {
              propertyType,
              location,
              urgency,
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

    // Find verified agents in the area with matching expertise
    const areaAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isVerified: true,
        agentProfile: {
          isActive: true,
          areasServed: {
            contains: location,
            mode: 'insensitive',
          },
          specializations: {
            has: propertyType,
          },
        },
      },
      include: {
        agentProfile: {
          select: {
            rating: true,
            totalValuations: true,
            successRate: true,
          },
        },
      },
      orderBy: [
        { agentProfile: { rating: 'desc' } },
        { agentProfile: { totalValuations: 'desc' } },
      ],
      take: 10, // Limit to top 10 matching agents
    })

    // Notify matched agents via Pusher
    for (const agent of areaAgents) {
      // Create agent-specific notification
      await pusher.trigger(
        `private-user-${agent.id}`,
        'new-valuation-request',
        {
          requestId: request.id,
          location,
          propertyType,
          propertySubType,
          urgency,
          matchScore: calculateMatchScore(agent, {
            propertyType,
            location,
            expectedValue,
          }),
          timestamp: new Date().toISOString(),
        }
      )

      // Create database notification
      await prisma.notification.create({
        data: {
          userId: agent.id,
          type: 'VALUATION_REQUEST',
          title: 'New Valuation Request',
          content: `New ${propertyType.toLowerCase()} valuation request in ${location}`,
          metadata: {
            requestId: request.id,
            propertyType,
            propertySubType,
            location,
            urgency,
            matchScore: calculateMatchScore(agent, {
              propertyType,
              location,
              expectedValue,
            }),
          },
        },
      })

      // Track agent notification
      await prisma.valuationRequestAgent.create({
        data: {
          requestId: request.id,
          agentId: agent.id,
          status: 'NOTIFIED',
          matchScore: calculateMatchScore(agent, {
            propertyType,
            location,
            expectedValue,
          }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      request: {
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
        matchedAgents: areaAgents.length,
      },
    })

  } catch (error) {
    console.error('[VALUATION_REQUEST_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Submit valuation offer (Verified Agents only)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify agent status and expertise
    const agent = await prisma.user.findUnique({
      where: { 
        id: session.user.id,
        role: 'AGENT',
        isVerified: true,
      },
      include: {
        agentProfile: true,
      },
    })

    if (!agent || !agent.agentProfile?.isActive) {
      return new NextResponse('Only verified active agents can submit valuations', { status: 403 })
    }

    const body = await req.json()
    const { 
      requestId,
      valuationAmount,
      confidence, // HIGH, MEDIUM, LOW
      methodology, // COMPARATIVE, INCOME, COST
      comparables, // Array of comparable properties
      timeframe,
      notes,
      marketingStrategy,
      additionalServices, // Optional additional services offered
    } = body

    // Create detailed valuation offer
    const offer = await prisma.valuationOffer.create({
      data: {
        requestId,
        agentId: session.user.id,
        amount: valuationAmount,
        confidence,
        methodology,
        comparables,
        timeframe,
        notes,
        marketingStrategy,
        additionalServices: additionalServices || [],
        status: 'PENDING',
        // Track offer creation
        activities: {
          create: {
            type: 'OFFER_SUBMITTED',
            description: 'Valuation offer submitted',
            userId: session.user.id,
            metadata: {
              amount: valuationAmount,
              methodology,
              confidence,
            },
          }
        },
      },
      include: {
        agent: {
          select: {
            name: true,
            email: true,
            agentProfile: {
              select: {
                rating: true,
                totalValuations: true,
                successRate: true,
                specializations: true,
              }
            },
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
        },
      },
    })

    // Update agent statistics
    await prisma.agentProfile.update({
      where: { userId: session.user.id },
      data: {
        totalValuations: {
          increment: 1,
        },
      },
    })

    // Notify property owner with comprehensive offer details
    await pusher.trigger(
      `private-user-${offer.request.user.id}`,
      'valuation-offer-received',
      {
        offerId: offer.id,
        requestId: offer.requestId,
        agent: {
          name: offer.agent.name,
          rating: offer.agent.agentProfile?.rating,
          totalValuations: offer.agent.agentProfile?.totalValuations,
          successRate: offer.agent.agentProfile?.successRate,
          specializations: offer.agent.agentProfile?.specializations,
        },
        amount: offer.amount,
        confidence: offer.confidence,
        methodology: offer.methodology,
        timeframe: offer.timeframe,
        additionalServices: offer.additionalServices,
        timestamp: new Date().toISOString(),
      }
    )

    // Create detailed notification for property owner
    await prisma.notification.create({
      data: {
        userId: offer.request.user.id,
        type: 'VALUATION_OFFER',
        title: 'New Valuation Offer Received',
        content: `${offer.agent.name} has submitted a detailed valuation for your property`,
        metadata: {
          offerId: offer.id,
          requestId: offer.requestId,
          agentId: offer.agentId,
          amount: offer.amount,
          agentRating: offer.agent.agentProfile?.rating,
          methodology: offer.methodology,
        },
      },
    })

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        status: offer.status,
        amount: offer.amount,
        createdAt: offer.createdAt,
      },
    })

  } catch (error) {
    console.error('[VALUATION_OFFER_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Helper function to calculate agent match score
function calculateMatchScore(agent: any, request: any): number {
  let score = 0

  // Property type match
  if (agent.agentProfile.specializations.includes(request.propertyType)) {
    score += 30
  }

  // Location expertise
  if (agent.agentProfile.areasServed.toLowerCase().includes(request.location.toLowerCase())) {
    score += 30
  }

  // Experience level
  score += Math.min(20, (agent.agentProfile.totalValuations / 10))

  // Success rate
  score += Math.min(20, (agent.agentProfile.successRate || 0))

  return Math.min(100, score)
}