import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create valuation request with Dublin agent routing
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      propertyType,
      location,
      specifications,
      images,
      description,
      urgency, // HIGH, MEDIUM, LOW
      contactPreferences,
      timeline,
    } = body

    // Create valuation request with Dublin-specific tracking
    const valuation = await prisma.valuationRequest.create({
      data: {
        userId: session.user.id,
        propertyType,
        location: {
          address: location.address,
          area: location.area,
          county: 'Dublin',
          eircode: location.eircode,
          coordinates: location.coordinates,
          dublinRegion: location.dublinRegion, // North/South/Central/West Dublin
        },
        specifications,
        images,
        description,
        urgency,
        contactPreferences,
        timeline,
        status: 'PENDING',
        currency: 'EUR',
        // Track valuation activity
        activities: {
          create: {
            type: 'VALUATION_REQUESTED',
            userId: session.user.id,
            description: 'Valuation request created',
            metadata: {
              propertyType,
              dublinRegion: location.dublinRegion,
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

    // Find qualified Dublin agents based on experience and ratings
    const qualifiedAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isVerified: true,
        agentProfile: {
          isActive: true,
          areasServed: {
            has: location.dublinRegion,
          },
          totalValuations: {
            gte: 5, // Minimum valuation experience
          },
          rating: {
            gte: 4, // Minimum rating requirement
          },
          // Ensure Dublin coverage
          OR: [
            { areasServed: { has: 'Dublin' } },
            { areasServed: { has: location.dublinRegion } },
          ],
        },
      },
      include: {
        agentProfile: {
          select: {
            rating: true,
            totalValuations: true,
            successRate: true,
            dublinExperience: true,
            areasServed: true,
          },
        },
      },
      orderBy: [
        { agentProfile: { rating: 'desc' } },
        { agentProfile: { totalValuations: 'desc' } },
      ],
      take: 5, // Limit to top 5 agents
    })

    // Create leads and notifications for qualified agents
    const agentNotifications = qualifiedAgents.map(agent =>
      Promise.all([
        // Create lead
        prisma.lead.create({
          data: {
            userId: agent.id,
            title: `Valuation Lead - ${propertyType} in ${location.dublinRegion}`,
            type: 'VALUATION',
            status: 'NEW',
            priority: urgency,
            source: 'VALUATION_REQUEST',
            currency: 'EUR',
            metadata: {
              valuationId: valuation.id,
              propertyType,
              location,
              timeline,
              dublinRegion: location.dublinRegion,
            },
          },
        }),
        // Create notification
        prisma.notification.create({
          data: {
            userId: agent.id,
            type: 'VALUATION_REQUEST',
            title: 'New Dublin Valuation Request',
            content: `Valuation needed for ${propertyType} in ${location.dublinRegion}`,
            metadata: {
              valuationId: valuation.id,
              propertyType,
              location,
              urgency,
              timeline,
              dublinRegion: location.dublinRegion,
            },
          },
        }),
        // Send real-time notification
        pusher.trigger(
          `private-user-${agent.id}`,
          'valuation-request',
          {
            valuationId: valuation.id,
            propertyType,
            location,
            urgency,
            timeline,
            dublinRegion: location.dublinRegion,
            timestamp: new Date().toISOString(),
          }
        ),
      ])
    )

    await Promise.all(agentNotifications)

    return NextResponse.json({
      success: true,
      valuation: {
        id: valuation.id,
        status: valuation.status,
        agentsNotified: qualifiedAgents.length,
      },
    })

  } catch (error) {
    console.error('[CREATE_VALUATION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Submit valuation bid (for Dublin agents)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      valuationId,
      estimatedValue,
      confidence, // HIGH, MEDIUM, LOW
      methodology,
      availability,
      notes,
      fee, // Optional valuation fee
    } = body

    // Verify Dublin agent status
    const agent = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        role: 'AGENT',
        isVerified: true,
        agentProfile: {
          isActive: true,
          areasServed: {
            hasSome: ['Dublin', 'North Dublin', 'South Dublin', 'Central Dublin', 'West Dublin'],
          },
        },
      },
      include: {
        agentProfile: true,
      },
    })

    if (!agent) {
      return new NextResponse('Only verified active Dublin agents can submit valuations', { status: 403 })
    }

    // Get valuation request details
    const valuation = await prisma.valuationRequest.findUnique({
      where: { id: valuationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    })

    if (!valuation) {
      return new NextResponse('Valuation request not found', { status: 404 })
    }

    // Create or update valuation bid
    const bid = await prisma.valuationBid.upsert({
      where: {
        valuationId_agentId: {
          valuationId,
          agentId: session.user.id,
        },
      },
      create: {
        valuationId,
        agentId: session.user.id,
        estimatedValue,
        confidence,
        methodology,
        availability,
        notes,
        fee,
        status: 'PENDING',
        currency: 'EUR',
        activities: {
          create: {
            type: 'BID_SUBMITTED',
            userId: session.user.id,
            description: 'Valuation bid submitted',
            metadata: {
              estimatedValue,
              confidence,
              fee,
              agentRating: agent.agentProfile.rating,
              totalValuations: agent.agentProfile.totalValuations,
              dublinExperience: agent.agentProfile.dublinExperience,
            },
          }
        },
      },
      update: {
        estimatedValue,
        confidence,
        methodology,
        availability,
        notes,
        fee,
        status: 'UPDATED',
        activities: {
          create: {
            type: 'BID_UPDATED',
            userId: session.user.id,
            description: 'Valuation bid updated',
            metadata: {
              estimatedValue,
              confidence,
              fee,
              agentRating: agent.agentProfile.rating,
              totalValuations: agent.agentProfile.totalValuations,
              dublinExperience: agent.agentProfile.dublinExperience,
            },
          }
        },
      },
      include: {
        agent: {
          select: {
            name: true,
            email: true,
            agentProfile: true,
          }
        },
      },
    })

    // Notify property owner
    await Promise.all([
      pusher.trigger(
        `private-user-${valuation.userId}`,
        'valuation-bid',
        {
          valuationId,
          agentName: agent.name,
          agentRating: agent.agentProfile.rating,
          totalValuations: agent.agentProfile.totalValuations,
          dublinExperience: agent.agentProfile.dublinExperience,
          estimatedValue,
          confidence,
          fee,
          availability,
          timestamp: new Date().toISOString(),
        }
      ),
      prisma.notification.create({
        data: {
          userId: valuation.userId,
          type: 'VALUATION_BID',
          title: 'New Valuation Bid',
          content: `${agent.name} has submitted a valuation bid for your property`,
          metadata: {
            valuationId,
            agentId: agent.id,
            estimatedValue,
            confidence,
            fee,
            agentRating: agent.agentProfile.rating,
            totalValuations: agent.agentProfile.totalValuations,
            dublinExperience: agent.agentProfile.dublinExperience,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      bid,
    })

  } catch (error) {
    console.error('[SUBMIT_VALUATION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get valuation requests with Dublin-specific filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const propertyType = searchParams.get('propertyType')
    const dublinRegion = searchParams.get('dublinRegion')
    const urgency = searchParams.get('urgency')
    const minValue = searchParams.get('minValue')
    const maxValue = searchParams.get('maxValue')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter conditions
    const where = {
      ...(session.user.role === 'AGENT'
        ? {
            OR: [
              { userId: session.user.id },
              {
                bids: {
                  some: { agentId: session.user.id },
                },
              },
            ],
          }
        : { userId: session.user.id }
      ),
      ...(status && { status }),
      ...(propertyType && { propertyType }),
      ...(dublinRegion && {
        location: {
          path: ['dublinRegion'],
          equals: dublinRegion,
        },
      }),
      ...(urgency && { urgency }),
      ...(minValue && {
        bids: {
          some: {
            estimatedValue: { gte: parseInt(minValue) },
          },
        },
      }),
      ...(maxValue && {
        bids: {
          some: {
            estimatedValue: { lte: parseInt(maxValue) },
          },
        },
      }),
    }

    // Get valuations with related data
    const valuations = await prisma.valuationRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        bids: {
          include: {
            agent: {
              select: {
                name: true,
                email: true,
                agentProfile: {
                  select: {
                    rating: true,
                    totalValuations: true,
                    dublinExperience: true,
                    areasServed: true,
                  }
                },
              }
            },
          },
          orderBy: [
            { confidence: 'desc' },
            { createdAt: 'desc' },
          ],
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            bids: true,
          }
        },
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count and Dublin-specific statistics
    const [total, stats] = await prisma.$transaction([
      prisma.valuationRequest.count({ where }),
      prisma.valuationRequest.groupBy({
        by: ['status', 'location', 'urgency'],
        where,
        _count: true,
        _avg: {
          'bids.estimatedValue': true,
          'bids.fee': true,
        },
      }),
    ])

    return NextResponse.json({
      valuations: valuations.map(valuation => ({
        ...valuation,
        averageValue: valuation.bids.reduce((acc, bid) => acc + bid.estimatedValue, 0) / 
                     (valuation.bids.length || 1),
        valueRange: {
          min: Math.min(...valuation.bids.map(bid => bid.estimatedValue)),
          max: Math.max(...valuation.bids.map(bid => bid.estimatedValue)),
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: stats.reduce((acc, curr) => ({
          ...acc,
          [curr.status]: {
            count: curr._count,
            averageValue: curr._avg['bids.estimatedValue'] || 0,
            averageFee: curr._avg['bids.fee'] || 0,
            dublinRegion: curr.location['dublinRegion'],
            urgency: curr.urgency,
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_VALUATIONS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}