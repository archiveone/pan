import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create property submission with 5% commission routing
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
      propertyType, // RESIDENTIAL, COMMERCIAL, LUXURY
      listingType, // SALE, RENT
      price,
      bedrooms,
      bathrooms,
      totalArea,
      features,
      description,
      contactPreference, // EMAIL, PHONE, BOTH
      urgency, // ASAP, WITHIN_WEEK, WITHIN_MONTH
      images,
      documents,
      expectedCommission, // Optional override of standard 5%
    } = body

    // Calculate commission (5% standard or custom)
    const commissionRate = expectedCommission || 5
    const potentialCommission = price * (commissionRate / 100)

    // Create property submission with commission tracking
    const submission = await prisma.propertySubmission.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        propertyDetails: {
          location,
          propertyType,
          listingType,
          price,
          bedrooms,
          bathrooms,
          totalArea,
          features,
          description,
        },
        contactPreference,
        urgency,
        images: images || [],
        documents: documents || [],
        commissionRate,
        potentialCommission,
        // Create commission tracking
        commissionTracking: {
          create: {
            standardRate: commissionRate,
            potentialValue: potentialCommission,
            status: 'PENDING',
            referralSplit: 20, // 20% referral split if applicable
          }
        },
        // Track submission activity
        activities: {
          create: {
            type: 'SUBMISSION_CREATED',
            userId: session.user.id,
            description: 'Property submission created',
            metadata: {
              propertyType,
              location,
              listingType,
              price,
              commissionRate,
              potentialCommission,
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
        commissionTracking: true,
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
          propertyTypes: {
            has: propertyType,
          },
          priceRangeExperience: {
            has: getPriceRange(price),
          },
        },
      },
      include: {
        agentProfile: {
          select: {
            rating: true,
            totalDeals: true,
            successRate: true,
            specializations: true,
          },
        },
      },
      orderBy: [
        { agentProfile: { rating: 'desc' } },
        { agentProfile: { successRate: 'desc' } },
      ],
      take: 10, // Limit to top 10 matching agents
    })

    // Notify matched agents via Pusher
    for (const agent of areaAgents) {
      const matchScore = calculateAgentMatchScore(agent, {
        propertyType,
        location,
        price,
        listingType,
      })

      // Send real-time notification
      await pusher.trigger(
        `private-user-${agent.id}`,
        'new-property-submission',
        {
          submissionId: submission.id,
          propertyType,
          location,
          listingType,
          price,
          commissionRate,
          potentialCommission,
          matchScore,
          timestamp: new Date().toISOString(),
        }
      )

      // Create database notification
      await prisma.notification.create({
        data: {
          userId: agent.id,
          type: 'PROPERTY_SUBMISSION',
          title: 'New Property Lead Available',
          content: `New ${propertyType} ${listingType.toLowerCase()} in ${location} - ${commissionRate}% commission`,
          metadata: {
            submissionId: submission.id,
            propertyType,
            location,
            price,
            commissionRate,
            potentialCommission,
            matchScore,
          },
        },
      })

      // Track agent notification and matching
      await prisma.propertySubmissionAgent.create({
        data: {
          submissionId: submission.id,
          agentId: agent.id,
          status: 'NOTIFIED',
          matchScore,
          commissionRate,
          potentialCommission,
        },
      })
    }

    // Create CRM lead for property owner
    await prisma.lead.create({
      data: {
        userId: session.user.id,
        title: `Property ${listingType} - ${location}`,
        status: 'NEW',
        type: 'PROPERTY',
        value: price,
        source: 'PROPERTY_SUBMISSION',
        notes: `Property submission created with ${areaAgents.length} matched agents`,
        metadata: {
          submissionId: submission.id,
          propertyType,
          location,
          commissionRate,
          matchedAgents: areaAgents.length,
        },
      },
    })

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        commissionRate,
        potentialCommission,
        matchedAgents: areaAgents.length,
        createdAt: submission.createdAt,
      },
    })

  } catch (error) {
    console.error('[PROPERTY_SUBMISSION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Express interest in property (Verified Agents only)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify agent status and eligibility
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
      return new NextResponse('Only verified active agents can express interest', { status: 403 })
    }

    const body = await req.json()
    const { 
      submissionId,
      message,
      availability, // IMMEDIATE, NEXT_24H, NEXT_WEEK
      preferredContact, // EMAIL, PHONE, IN_PERSON
      proposedStrategy, // Optional marketing/sales strategy
    } = body

    // Create agent interest with tracking
    const interest = await prisma.agentInterest.create({
      data: {
        submissionId,
        agentId: session.user.id,
        message,
        availability,
        preferredContact,
        proposedStrategy,
        status: 'PENDING',
        // Track interest activity
        activities: {
          create: {
            type: 'INTEREST_EXPRESSED',
            userId: session.user.id,
            description: 'Agent expressed interest',
            metadata: {
              availability,
              preferredContact,
              hasStrategy: !!proposedStrategy,
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
                totalDeals: true,
                successRate: true,
                specializations: true,
              }
            },
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
            },
            propertyDetails: true,
            commissionTracking: true,
          }
        },
      },
    })

    // Update agent's engagement metrics
    await prisma.agentProfile.update({
      where: { userId: session.user.id },
      data: {
        totalInterests: { increment: 1 },
        lastInterestAt: new Date(),
      },
    })

    // Notify property owner with comprehensive agent details
    await pusher.trigger(
      `private-user-${interest.submission.user.id}`,
      'agent-interest',
      {
        interestId: interest.id,
        submissionId,
        agent: {
          name: interest.agent.name,
          rating: interest.agent.agentProfile?.rating,
          totalDeals: interest.agent.agentProfile?.totalDeals,
          successRate: interest.agent.agentProfile?.successRate,
          specializations: interest.agent.agentProfile?.specializations,
        },
        message,
        availability,
        hasStrategy: !!proposedStrategy,
        commissionDetails: {
          rate: interest.submission.commissionRate,
          potential: interest.submission.commissionTracking?.potentialValue,
        },
        timestamp: new Date().toISOString(),
      }
    )

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: interest.submission.user.id,
        type: 'AGENT_INTEREST',
        title: 'Agent Interested in Your Property',
        content: `${interest.agent.name} (${interest.agent.agentProfile?.rating}★) wants to handle your property`,
        metadata: {
          interestId: interest.id,
          submissionId,
          agentId: session.user.id,
          agentRating: interest.agent.agentProfile?.rating,
          agentDeals: interest.agent.agentProfile?.totalDeals,
          availability,
          hasStrategy: !!proposedStrategy,
        },
      },
    })

    // Update CRM lead status
    await prisma.lead.updateMany({
      where: {
        userId: interest.submission.user.id,
        metadata: {
          path: ['submissionId'],
          equals: submissionId,
        },
      },
      data: {
        status: 'QUALIFIED',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      interest: {
        id: interest.id,
        status: interest.status,
        createdAt: interest.createdAt,
      },
    })

  } catch (error) {
    console.error('[EXPRESS_INTEREST_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Helper function to calculate agent match score
function calculateAgentMatchScore(agent: any, property: any): number {
  let score = 0

  // Property type expertise (30 points)
  if (agent.agentProfile?.propertyTypes?.includes(property.propertyType)) {
    score += 30
  }

  // Location expertise (30 points)
  if (agent.agentProfile?.areasServed?.toLowerCase()
        .includes(property.location.toLowerCase())) {
    score += 30
  }

  // Price range experience (20 points)
  const priceRange = getPriceRange(property.price)
  if (agent.agentProfile?.priceRangeExperience?.includes(priceRange)) {
    score += 20
  }

  // Success rate bonus (up to 10 points)
  score += Math.min(10, (agent.agentProfile?.successRate || 0) / 10)

  // Recent activity bonus (up to 10 points)
  const daysSinceLastDeal = agent.agentProfile?.lastDealAt
    ? Math.floor((Date.now() - new Date(agent.agentProfile.lastDealAt).getTime()) / (1000 * 60 * 60 * 24))
    : 365
  score += Math.min(10, Math.max(0, 10 - (daysSinceLastDeal / 30)))

  return Math.min(100, Math.round(score))
}

// Helper function to determine price range
function getPriceRange(price: number): string {
  if (price < 100000) return 'BUDGET'
  if (price < 500000) return 'MID_RANGE'
  if (price < 1000000) return 'PREMIUM'
  return 'LUXURY'
}