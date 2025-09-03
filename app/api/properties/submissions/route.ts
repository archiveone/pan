import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create property submission with Dublin-focused agent routing
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      propertyType, // RESIDENTIAL, COMMERCIAL, LUXURY
      listingType, // SALE, RENTAL
      location,
      price,
      specifications,
      images,
      description,
      availability,
      contactPreferences,
    } = body

    // Create property submission with Dublin-specific tracking
    const submission = await prisma.propertySubmission.create({
      data: {
        userId: session.user.id,
        propertyType,
        listingType,
        location: {
          address: location.address,
          area: location.area,
          county: 'Dublin',
          eircode: location.eircode,
          coordinates: location.coordinates,
          dublinRegion: location.dublinRegion, // North/South/Central/West Dublin
        },
        price,
        specifications,
        images,
        description,
        availability,
        contactPreferences,
        status: 'PENDING',
        commissionRate: 5, // 5% standard commission
        currency: 'EUR',
        // Track submission activity
        activities: {
          create: {
            type: 'SUBMISSION_CREATED',
            userId: session.user.id,
            description: 'Property submission created',
            metadata: {
              propertyType,
              listingType,
              price,
              dublinRegion: location.dublinRegion,
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

    // Find matching Dublin agents based on region and property type
    const matchingAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isVerified: true,
        agentProfile: {
          isActive: true,
          areasServed: {
            has: location.dublinRegion,
          },
          specializations: {
            has: propertyType,
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
            totalDeals: true,
            successRate: true,
            areasServed: true,
            dublinExperience: true,
          },
        },
      },
      orderBy: [
        { agentProfile: { rating: 'desc' } },
        { agentProfile: { totalDeals: 'desc' } },
      ],
      take: 10, // Limit to top 10 agents
    })

    // Calculate potential commission
    const potentialCommission = price * 0.05 // 5% commission

    // Create leads and notifications for matching agents
    const agentNotifications = matchingAgents.map(agent =>
      Promise.all([
        // Create lead
        prisma.lead.create({
          data: {
            userId: agent.id,
            title: `Property Lead - ${propertyType} in ${location.dublinRegion}`,
            type: 'PROPERTY',
            status: 'NEW',
            value: potentialCommission,
            source: 'PROPERTY_SUBMISSION',
            currency: 'EUR',
            metadata: {
              submissionId: submission.id,
              propertyType,
              listingType,
              location,
              price,
              dublinRegion: location.dublinRegion,
            },
          },
        }),
        // Create notification
        prisma.notification.create({
          data: {
            userId: agent.id,
            type: 'PROPERTY_LEAD',
            title: 'New Dublin Property Lead',
            content: `New ${propertyType} ${listingType.toLowerCase()} in ${location.dublinRegion}`,
            metadata: {
              submissionId: submission.id,
              propertyType,
              listingType,
              location,
              price,
              commission: potentialCommission,
              currency: 'EUR',
              dublinRegion: location.dublinRegion,
            },
          },
        }),
        // Send real-time notification
        pusher.trigger(
          `private-user-${agent.id}`,
          'property-lead',
          {
            submissionId: submission.id,
            propertyType,
            listingType,
            location,
            price,
            commission: potentialCommission,
            currency: 'EUR',
            dublinRegion: location.dublinRegion,
            timestamp: new Date().toISOString(),
          }
        ),
      ])
    )

    await Promise.all(agentNotifications)

    // Create CRM lead for property owner
    await prisma.lead.create({
      data: {
        userId: session.user.id,
        title: `My Property Submission - ${propertyType} in ${location.dublinRegion}`,
        type: 'MY_PROPERTY',
        status: 'NEW',
        value: price,
        source: 'SELF_SUBMISSION',
        currency: 'EUR',
        metadata: {
          submissionId: submission.id,
          propertyType,
          listingType,
          location,
          dublinRegion: location.dublinRegion,
        },
      },
    })

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        agentsNotified: matchingAgents.length,
        potentialCommission,
        currency: 'EUR',
      },
    })

  } catch (error) {
    console.error('[CREATE_SUBMISSION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Express interest in property (for Dublin agents)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      submissionId,
      action, // EXPRESS_INTEREST, WITHDRAW_INTEREST
      availability,
      message,
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
      return new NextResponse('Only verified active Dublin agents can express interest', { status: 403 })
    }

    // Get submission details
    const submission = await prisma.propertySubmission.findUnique({
      where: { id: submissionId },
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

    if (!submission) {
      return new NextResponse('Submission not found', { status: 404 })
    }

    if (action === 'EXPRESS_INTEREST') {
      // Create or update agent interest
      const interest = await prisma.agentInterest.upsert({
        where: {
          submissionId_agentId: {
            submissionId,
            agentId: session.user.id,
          },
        },
        create: {
          submissionId,
          agentId: session.user.id,
          status: 'PENDING',
          availability,
          message,
          // Track interest activity
          activities: {
            create: {
              type: 'INTEREST_EXPRESSED',
              userId: session.user.id,
              description: 'Agent expressed interest',
              metadata: {
                availability,
                agentRating: agent.agentProfile.rating,
                totalDeals: agent.agentProfile.totalDeals,
                dublinExperience: agent.agentProfile.dublinExperience,
              },
            }
          },
        },
        update: {
          status: 'PENDING',
          availability,
          message,
          activities: {
            create: {
              type: 'INTEREST_UPDATED',
              userId: session.user.id,
              description: 'Agent updated interest',
              metadata: {
                availability,
                agentRating: agent.agentProfile.rating,
                totalDeals: agent.agentProfile.totalDeals,
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
          `private-user-${submission.userId}`,
          'agent-interest',
          {
            submissionId,
            agentName: agent.name,
            agentRating: agent.agentProfile.rating,
            totalDeals: agent.agentProfile.totalDeals,
            dublinExperience: agent.agentProfile.dublinExperience,
            availability,
            timestamp: new Date().toISOString(),
          }
        ),
        prisma.notification.create({
          data: {
            userId: submission.userId,
            type: 'AGENT_INTEREST',
            title: 'Dublin Agent Interested',
            content: `${agent.name} has expressed interest in your ${submission.propertyType.toLowerCase()}`,
            metadata: {
              submissionId,
              agentId: agent.id,
              agentRating: agent.agentProfile.rating,
              totalDeals: agent.agentProfile.totalDeals,
              dublinExperience: agent.agentProfile.dublinExperience,
            },
          },
        }),
      ])

      return NextResponse.json({
        success: true,
        interest,
      })

    } else if (action === 'WITHDRAW_INTEREST') {
      // Withdraw interest
      await prisma.agentInterest.update({
        where: {
          submissionId_agentId: {
            submissionId,
            agentId: session.user.id,
          },
        },
        data: {
          status: 'WITHDRAWN',
          activities: {
            create: {
              type: 'INTEREST_WITHDRAWN',
              userId: session.user.id,
              description: 'Agent withdrew interest',
              metadata: {
                previousAvailability: availability,
              },
            }
          },
        },
      })

      // Notify property owner
      await Promise.all([
        pusher.trigger(
          `private-user-${submission.userId}`,
          'agent-withdrew',
          {
            submissionId,
            agentName: agent.name,
            timestamp: new Date().toISOString(),
          }
        ),
        prisma.notification.create({
          data: {
            userId: submission.userId,
            type: 'AGENT_WITHDREW',
            title: 'Agent Withdrew Interest',
            content: `${agent.name} has withdrawn interest in your ${submission.propertyType.toLowerCase()}`,
            metadata: {
              submissionId,
              agentId: agent.id,
            },
          },
        }),
      ])

      return NextResponse.json({ success: true })
    }

    return new NextResponse('Invalid action', { status: 400 })

  } catch (error) {
    console.error('[UPDATE_SUBMISSION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get property submissions with Dublin-specific filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const propertyType = searchParams.get('propertyType')
    const listingType = searchParams.get('listingType')
    const dublinRegion = searchParams.get('dublinRegion')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter conditions
    const where = {
      ...(session.user.role === 'AGENT'
        ? {
            OR: [
              { userId: session.user.id },
              {
                agentInterests: {
                  some: { agentId: session.user.id },
                },
              },
            ],
          }
        : { userId: session.user.id }
      ),
      ...(status && { status }),
      ...(propertyType && { propertyType }),
      ...(listingType && { listingType }),
      ...(dublinRegion && {
        location: {
          path: ['dublinRegion'],
          equals: dublinRegion,
        },
      }),
      ...(minPrice && { price: { gte: parseInt(minPrice) } }),
      ...(maxPrice && { price: { lte: parseInt(maxPrice) } }),
    }

    // Get submissions with related data
    const submissions = await prisma.propertySubmission.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        agentInterests: {
          include: {
            agent: {
              select: {
                name: true,
                email: true,
                agentProfile: {
                  select: {
                    rating: true,
                    totalDeals: true,
                    dublinExperience: true,
                    areasServed: true,
                  }
                },
              }
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            agentInterests: true,
          }
        },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count and Dublin-specific statistics
    const [total, stats] = await prisma.$transaction([
      prisma.propertySubmission.count({ where }),
      prisma.propertySubmission.groupBy({
        by: ['status', 'location'],
        where,
        _count: true,
        _sum: {
          price: true,
        },
        _avg: {
          price: true,
          commissionRate: true,
        },
      }),
    ])

    return NextResponse.json({
      submissions: submissions.map(submission => ({
        ...submission,
        potentialCommission: submission.price * 0.05,
        currency: 'EUR',
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
            totalValue: curr._sum.price || 0,
            averageValue: curr._avg.price || 0,
            averageCommission: (curr._avg.price || 0) * 0.05,
            dublinRegion: curr.location['dublinRegion'],
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_SUBMISSIONS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}