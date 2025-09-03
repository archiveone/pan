import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create agent referral with 20% commission split
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify referring agent status
    const referringAgent = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        role: 'AGENT',
        isVerified: true,
        agentProfile: {
          isActive: true,
        },
      },
      include: {
        agentProfile: true,
      },
    })

    if (!referringAgent) {
      return new NextResponse('Only verified active agents can create referrals', { status: 403 })
    }

    const body = await req.json()
    const { 
      type, // SALE, RENTAL, VALUATION
      propertyDetails,
      clientDetails,
      referredAgentId,
      notes,
    } = body

    // Verify referred agent status and Dublin coverage
    const referredAgent = await prisma.user.findUnique({
      where: {
        id: referredAgentId,
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

    if (!referredAgent) {
      return new NextResponse('Referred agent must be verified and active in Dublin', { status: 400 })
    }

    // Create referral with commission tracking
    const referral = await prisma.agentReferral.create({
      data: {
        referringAgentId: session.user.id,
        referredAgentId,
        type,
        status: 'PENDING',
        propertyDetails: {
          ...propertyDetails,
          location: {
            ...propertyDetails.location,
            county: 'Dublin',
            dublinRegion: propertyDetails.location.dublinRegion,
          },
        },
        clientDetails,
        notes,
        commissionSplit: 20, // 20% standard referral commission
        currency: 'EUR',
        // Track referral activity
        activities: {
          create: {
            type: 'REFERRAL_CREATED',
            userId: session.user.id,
            description: 'Agent referral created',
            metadata: {
              referralType: type,
              propertyLocation: propertyDetails.location,
              referringAgentRating: referringAgent.agentProfile.rating,
              referredAgentRating: referredAgent.agentProfile.rating,
              dublinRegion: propertyDetails.location.dublinRegion,
            },
          }
        },
      },
      include: {
        referringAgent: {
          select: {
            name: true,
            email: true,
            agentProfile: true,
          }
        },
        referredAgent: {
          select: {
            name: true,
            email: true,
            agentProfile: true,
          }
        },
      },
    })

    // Create CRM leads for both agents
    await Promise.all([
      // Lead for referring agent
      prisma.lead.create({
        data: {
          userId: session.user.id,
          title: `Dublin Referral to ${referredAgent.name} - ${type}`,
          type: 'REFERRAL',
          status: 'NEW',
          source: 'AGENT_REFERRAL',
          value: 0, // Will be updated when deal completes
          currency: 'EUR',
          metadata: {
            referralId: referral.id,
            type,
            propertyDetails,
            referredAgentId,
            dublinRegion: propertyDetails.location.dublinRegion,
          },
        },
      }),
      // Lead for referred agent
      prisma.lead.create({
        data: {
          userId: referredAgentId,
          title: `Dublin Referral from ${referringAgent.name} - ${type}`,
          type: 'REFERRAL',
          status: 'NEW',
          source: 'AGENT_REFERRAL',
          value: 0, // Will be updated when deal completes
          currency: 'EUR',
          metadata: {
            referralId: referral.id,
            type,
            propertyDetails,
            clientDetails,
            dublinRegion: propertyDetails.location.dublinRegion,
          },
        },
      }),
    ])

    // Send notifications to referred agent
    await Promise.all([
      pusher.trigger(
        `private-user-${referredAgentId}`,
        'referral-received',
        {
          referralId: referral.id,
          type,
          referringAgentName: referringAgent.name,
          propertyDetails,
          dublinRegion: propertyDetails.location.dublinRegion,
          timestamp: new Date().toISOString(),
        }
      ),
      prisma.notification.create({
        data: {
          userId: referredAgentId,
          type: 'REFERRAL_RECEIVED',
          title: 'New Dublin Referral',
          content: `${referringAgent.name} has referred a ${type.toLowerCase()} client in ${propertyDetails.location.dublinRegion}`,
          metadata: {
            referralId: referral.id,
            type,
            propertyDetails,
            referringAgentId: session.user.id,
            dublinRegion: propertyDetails.location.dublinRegion,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      referral,
    })

  } catch (error) {
    console.error('[CREATE_REFERRAL_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update referral status and handle commission
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      referralId,
      status, // ACCEPTED, REJECTED, COMPLETED
      dealValue,
      notes,
    } = body

    // Get referral details
    const referral = await prisma.agentReferral.findUnique({
      where: { id: referralId },
      include: {
        referringAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            agentProfile: true,
          }
        },
        referredAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            agentProfile: true,
          }
        },
      },
    })

    if (!referral) {
      return new NextResponse('Referral not found', { status: 404 })
    }

    // Verify user is involved in referral
    if (referral.referredAgentId !== session.user.id && 
        referral.referringAgentId !== session.user.id) {
      return new NextResponse('Unauthorized access to referral', { status: 403 })
    }

    // Calculate commissions if deal completed
    let referringAgentCommission = 0
    let referredAgentCommission = 0
    
    if (status === 'COMPLETED' && dealValue) {
      const standardCommission = dealValue * 0.05 // 5% standard commission
      referringAgentCommission = standardCommission * 0.20 // 20% referral split
      referredAgentCommission = standardCommission * 0.80 // 80% main agent split
    }

    // Update referral status
    const updatedReferral = await prisma.agentReferral.update({
      where: { id: referralId },
      data: {
        status,
        dealValue: status === 'COMPLETED' ? dealValue : undefined,
        referringAgentCommission,
        referredAgentCommission,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        activities: {
          create: {
            type: `REFERRAL_${status}`,
            userId: session.user.id,
            description: `Referral ${status.toLowerCase()}`,
            metadata: {
              dealValue,
              referringAgentCommission,
              referredAgentCommission,
              currency: 'EUR',
            },
          }
        },
      },
    })

    // Update agent profiles if completed
    if (status === 'COMPLETED') {
      await Promise.all([
        // Update referring agent stats
        prisma.agentProfile.update({
          where: { userId: referral.referringAgentId },
          data: {
            totalReferrals: { increment: 1 },
            successfulReferrals: { increment: 1 },
            totalReferralCommission: { increment: referringAgentCommission },
            dublinReferrals: { increment: 1 },
          },
        }),
        // Update referred agent stats
        prisma.agentProfile.update({
          where: { userId: referral.referredAgentId },
          data: {
            totalDeals: { increment: 1 },
            totalCommission: { increment: referredAgentCommission },
            dublinDeals: { increment: 1 },
          },
        }),
      ])
    }

    // Update CRM leads
    await prisma.lead.updateMany({
      where: {
        metadata: {
          path: ['referralId'],
          equals: referralId,
        },
      },
      data: {
        status: status === 'COMPLETED' ? 'WON' :
                status === 'REJECTED' ? 'LOST' : 'QUALIFIED',
        value: status === 'COMPLETED' ? dealValue : 0,
        updatedAt: new Date(),
      },
    })

    // Send notifications
    const recipientId = session.user.id === referral.referringAgentId
      ? referral.referredAgentId
      : referral.referringAgentId

    await Promise.all([
      pusher.trigger(
        `private-user-${recipientId}`,
        'referral-update',
        {
          referralId,
          status,
          dealValue,
          updatedBy: session.user.name,
          commission: recipientId === referral.referringAgentId
            ? referringAgentCommission
            : referredAgentCommission,
          currency: 'EUR',
          timestamp: new Date().toISOString(),
        }
      ),
      prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'REFERRAL_UPDATE',
          title: `Dublin Referral ${status.toLowerCase()}`,
          content: status === 'COMPLETED'
            ? `Referral completed with deal value €${dealValue}`
            : `Referral ${status.toLowerCase()} by ${session.user.name}`,
          metadata: {
            referralId,
            status,
            dealValue,
            commission: recipientId === referral.referringAgentId
              ? referringAgentCommission
              : referredAgentCommission,
            currency: 'EUR',
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      referral: updatedReferral,
    })

  } catch (error) {
    console.error('[UPDATE_REFERRAL_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get referrals with Dublin-specific filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const role = searchParams.get('role') // 'referring' or 'referred'
    const dublinRegion = searchParams.get('dublinRegion')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter conditions
    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(role === 'referring'
        ? { referringAgentId: session.user.id }
        : role === 'referred'
        ? { referredAgentId: session.user.id }
        : {
            OR: [
              { referringAgentId: session.user.id },
              { referredAgentId: session.user.id },
            ],
          }
      ),
      ...(dublinRegion && {
        propertyDetails: {
          path: ['location', 'dublinRegion'],
          equals: dublinRegion,
        },
      }),
    }

    // Get referrals with related data
    const referrals = await prisma.agentReferral.findMany({
      where,
      include: {
        referringAgent: {
          select: {
            name: true,
            email: true,
            agentProfile: {
              select: {
                rating: true,
                totalReferrals: true,
                successfulReferrals: true,
                dublinReferrals: true,
              }
            },
          }
        },
        referredAgent: {
          select: {
            name: true,
            email: true,
            agentProfile: {
              select: {
                rating: true,
                totalDeals: true,
                successRate: true,
                dublinDeals: true,
              }
            },
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
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
      prisma.agentReferral.count({ where }),
      prisma.agentReferral.groupBy({
        by: ['status', 'type', 'propertyDetails'],
        where,
        _count: true,
        _sum: {
          dealValue: true,
          referringAgentCommission: true,
          referredAgentCommission: true,
        },
      }),
    ])

    return NextResponse.json({
      referrals,
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
            totalDealValue: curr._sum.dealValue || 0,
            totalReferringCommission: curr._sum.referringAgentCommission || 0,
            totalReferredCommission: curr._sum.referredAgentCommission || 0,
            type: curr.type,
            dublinRegion: curr.propertyDetails['location']['dublinRegion'],
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_REFERRALS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}