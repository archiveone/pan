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
      },
      include: {
        agentProfile: true,
      },
    })

    if (!referringAgent || !referringAgent.agentProfile?.isActive) {
      return new NextResponse('Only verified active agents can create referrals', { status: 403 })
    }

    const body = await req.json()
    const { 
      propertyId,
      referredAgentId,
      propertyValue,
      referralType, // SALE, RENTAL, VALUATION
      notes,
      expectedCommission, // Optional override of standard commission
    } = body

    // Verify referred agent
    const referredAgent = await prisma.user.findUnique({
      where: {
        id: referredAgentId,
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

    if (!referredAgent) {
      return new NextResponse('Referred agent must be verified and active', { status: 400 })
    }

    // Calculate potential commissions
    const standardCommission = propertyValue * 0.05 // 5% standard commission
    const commissionAmount = expectedCommission || standardCommission
    const referralSplit = commissionAmount * 0.20 // 20% referral split

    // Create referral with commission tracking
    const referral = await prisma.agentReferral.create({
      data: {
        referringAgentId: session.user.id,
        referredAgentId,
        propertyId,
        status: 'PENDING',
        referralType,
        propertyValue,
        standardCommission,
        expectedCommission: expectedCommission || null,
        referralSplit,
        notes,
        // Track referral activity
        activities: {
          create: {
            type: 'REFERRAL_CREATED',
            userId: session.user.id,
            description: 'Agent referral created',
            metadata: {
              propertyValue,
              referralType,
              standardCommission,
              referralSplit,
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

    // Create commission tracking records
    await prisma.commissionTracking.create({
      data: {
        referralId: referral.id,
        agentId: session.user.id,
        type: 'REFERRAL',
        status: 'PENDING',
        standardRate: 20, // 20% of the standard commission
        potentialValue: referralSplit,
        metadata: {
          propertyValue,
          standardCommission,
          referralSplit,
        },
      },
    })

    // Notify referred agent via Pusher
    await pusher.trigger(
      `private-user-${referredAgentId}`,
      'new-referral',
      {
        referralId: referral.id,
        referringAgent: {
          name: referral.referringAgent.name,
          rating: referral.referringAgent.agentProfile?.rating,
          totalDeals: referral.referringAgent.agentProfile?.totalDeals,
        },
        propertyValue,
        referralType,
        standardCommission,
        referralSplit,
        timestamp: new Date().toISOString(),
      }
    )

    // Create notification for referred agent
    await prisma.notification.create({
      data: {
        userId: referredAgentId,
        type: 'AGENT_REFERRAL',
        title: 'New Agent Referral',
        content: `${referral.referringAgent.name} has referred a ${referralType.toLowerCase()} opportunity to you`,
        metadata: {
          referralId: referral.id,
          referringAgentId: session.user.id,
          propertyValue,
          standardCommission,
          referralSplit,
        },
      },
    })

    // Create CRM leads for both agents
    await prisma.$transaction([
      // Referring agent lead
      prisma.lead.create({
        data: {
          userId: session.user.id,
          title: `Referral to ${referral.referredAgent.name}`,
          status: 'NEW',
          type: 'REFERRAL',
          value: referralSplit,
          source: 'AGENT_REFERRAL',
          notes: `Referral created for ${referralType} opportunity`,
          metadata: {
            referralId: referral.id,
            referredAgentId,
            propertyValue,
            referralType,
          },
        },
      }),
      // Referred agent lead
      prisma.lead.create({
        data: {
          userId: referredAgentId,
          title: `Referral from ${referral.referringAgent.name}`,
          status: 'NEW',
          type: 'REFERRAL',
          value: commissionAmount - referralSplit,
          source: 'AGENT_REFERRAL',
          notes: `Referral received for ${referralType} opportunity`,
          metadata: {
            referralId: referral.id,
            referringAgentId: session.user.id,
            propertyValue,
            referralType,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        status: referral.status,
        propertyValue,
        standardCommission,
        referralSplit,
        createdAt: referral.createdAt,
      },
    })

  } catch (error) {
    console.error('[CREATE_REFERRAL_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update referral status
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
      finalValue, // Final property value if different
      actualCommission, // Actual commission earned
      notes,
    } = body

    // Verify referral access
    const existingReferral = await prisma.agentReferral.findUnique({
      where: { id: referralId },
      include: {
        referringAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        referredAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    })

    if (!existingReferral || 
        (existingReferral.referringAgentId !== session.user.id && 
         existingReferral.referredAgentId !== session.user.id)) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Calculate final commissions if completed
    const finalCommission = status === 'COMPLETED' 
      ? (actualCommission || ((finalValue || existingReferral.propertyValue) * 0.05))
      : existingReferral.standardCommission

    const finalReferralSplit = status === 'COMPLETED'
      ? finalCommission * 0.20
      : existingReferral.referralSplit

    // Update referral status
    const updatedReferral = await prisma.agentReferral.update({
      where: { id: referralId },
      data: {
        status,
        propertyValue: finalValue || existingReferral.propertyValue,
        standardCommission: finalCommission,
        referralSplit: finalReferralSplit,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        notes: notes || null,
        // Track status change
        activities: {
          create: {
            type: 'REFERRAL_STATUS_UPDATED',
            userId: session.user.id,
            description: `Referral status updated to ${status}`,
            metadata: {
              oldStatus: existingReferral.status,
              newStatus: status,
              finalValue,
              actualCommission,
            },
          }
        },
      },
    })

    // Update commission tracking if completed
    if (status === 'COMPLETED') {
      await prisma.commissionTracking.updateMany({
        where: { referralId },
        data: {
          status: 'COMPLETED',
          actualValue: finalReferralSplit,
          completedAt: new Date(),
        },
      })

      // Update agent statistics
      await prisma.$transaction([
        // Referring agent
        prisma.agentProfile.update({
          where: { userId: existingReferral.referringAgentId },
          data: {
            totalReferrals: { increment: 1 },
            totalReferralCommission: { increment: finalReferralSplit },
          },
        }),
        // Referred agent
        prisma.agentProfile.update({
          where: { userId: existingReferral.referredAgentId },
          data: {
            totalDeals: { increment: 1 },
            totalCommission: { increment: finalCommission - finalReferralSplit },
          },
        }),
      ])
    }

    // Send notifications to both agents
    const [referringAgentNotification, referredAgentNotification] = await Promise.all([
      // Notify referring agent
      pusher.trigger(
        `private-user-${existingReferral.referringAgentId}`,
        'referral-update',
        {
          referralId,
          status,
          finalValue,
          finalCommission,
          finalReferralSplit,
          timestamp: new Date().toISOString(),
        }
      ),
      // Notify referred agent
      pusher.trigger(
        `private-user-${existingReferral.referredAgentId}`,
        'referral-update',
        {
          referralId,
          status,
          finalValue,
          finalCommission,
          finalReferralSplit,
          timestamp: new Date().toISOString(),
        }
      ),
    ])

    // Update CRM leads
    const leadStatus = status === 'ACCEPTED' ? 'QUALIFIED' :
                      status === 'COMPLETED' ? 'WON' :
                      status === 'REJECTED' ? 'LOST' : 'NEW'

    await prisma.lead.updateMany({
      where: {
        metadata: {
          path: ['referralId'],
          equals: referralId,
        },
      },
      data: {
        status: leadStatus,
        value: status === 'COMPLETED' 
          ? finalReferralSplit // For referring agent
          : finalCommission - finalReferralSplit, // For referred agent
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      referral: updatedReferral,
    })

  } catch (error) {
    console.error('[UPDATE_REFERRAL_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get agent referrals with filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'given' or 'received'
    const referralType = searchParams.get('referralType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter conditions
    const where = {
      ...(status && { status }),
      ...(referralType && { referralType }),
      ...(type === 'given'
        ? { referringAgentId: session.user.id }
        : { referredAgentId: session.user.id }
      ),
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
                totalDeals: true,
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
              }
            },
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count and statistics
    const [total, stats] = await prisma.$transaction([
      prisma.agentReferral.count({ where }),
      prisma.agentReferral.groupBy({
        by: ['status'],
        where: {
          OR: [
            { referringAgentId: session.user.id },
            { referredAgentId: session.user.id },
          ],
        },
        _count: true,
        _sum: {
          referralSplit: true,
          standardCommission: true,
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
            totalReferralSplit: curr._sum.referralSplit || 0,
            totalCommission: curr._sum.standardCommission || 0,
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_REFERRALS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}