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

    // Verify that referrer is a verified agent
    const referrer = await prisma.user.findUnique({
      where: { 
        id: session.user.id,
        role: 'AGENT',
        isVerified: true,
      },
      include: {
        agentProfile: true,
      },
    })

    if (!referrer || !referrer.agentProfile?.isActive) {
      return new NextResponse('Only verified active agents can create referrals', { status: 403 })
    }

    const body = await req.json()
    const { 
      propertyId,
      referredAgentEmail,
      notes,
      propertyValue, // Optional - for commission calculation
    } = body

    // Find or create referred agent
    const referredAgent = await prisma.user.findUnique({
      where: { 
        email: referredAgentEmail,
        role: 'AGENT',
      },
      include: {
        agentProfile: true,
      },
    })

    if (!referredAgent || !referredAgent.agentProfile?.isActive) {
      return new NextResponse('Invalid or inactive referred agent', { status: 400 })
    }

    // Calculate potential commission
    const standardCommission = propertyValue ? (propertyValue * 0.05) : null // 5% standard
    const referralCommission = standardCommission ? (standardCommission * 0.20) : null // 20% of standard

    // Create referral with commission tracking
    const referral = await prisma.agentReferral.create({
      data: {
        propertyId,
        referrerId: session.user.id,
        referredAgentId: referredAgent.id,
        status: 'PENDING',
        commissionSplit: 20, // 20% split for referrals
        notes,
        propertyValue,
        potentialCommission: standardCommission,
        referralCommission,
        // Create commission tracking
        commissionTracking: {
          create: {
            standardRate: 5, // 5% standard commission
            referralSplit: 20, // 20% to referrer
            status: 'PENDING',
            potentialValue: standardCommission,
            referralValue: referralCommission,
          }
        },
      },
      include: {
        referrer: {
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
        property: true,
        commissionTracking: true,
      }
    })

    // Create activity logs for both agents
    await prisma.$transaction([
      // Referrer activity
      prisma.activityLog.create({
        data: {
          userId: session.user.id,
          type: 'REFERRAL_SENT',
          entityType: 'REFERRAL',
          entityId: referral.id,
          description: `Referral sent to ${referredAgent.name}`,
          metadata: {
            referralId: referral.id,
            propertyId,
            referredAgentId: referredAgent.id,
            commissionSplit: 20,
            potentialCommission: standardCommission,
            referralCommission,
          },
        },
      }),
      // Referred agent activity
      prisma.activityLog.create({
        data: {
          userId: referredAgent.id,
          type: 'REFERRAL_RECEIVED',
          entityType: 'REFERRAL',
          entityId: referral.id,
          description: `Referral received from ${session.user.name}`,
          metadata: {
            referralId: referral.id,
            propertyId,
            referrerId: session.user.id,
            commissionSplit: 20,
            potentialCommission: standardCommission,
          },
        },
      }),
    ])

    // Send real-time notifications to referred agent
    await pusher.trigger(
      `private-user-${referredAgent.id}`,
      'new-referral',
      {
        referralId: referral.id,
        referrer: {
          name: referral.referrer.name,
          email: referral.referrer.email,
          rating: referral.referrer.agentProfile?.rating,
        },
        property: referral.property,
        commissionSplit: referral.commissionSplit,
        potentialCommission: standardCommission,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json(referral)

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
      notes,
      finalPropertyValue, // For completed referrals
    } = body

    // Verify referral participation
    const existingReferral = await prisma.agentReferral.findUnique({
      where: { id: referralId },
      include: {
        commissionTracking: true,
        referrer: {
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
        (existingReferral.referredAgentId !== session.user.id && 
         existingReferral.referrerId !== session.user.id)) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Calculate final commission amounts if completed
    const finalCommission = status === 'COMPLETED' && finalPropertyValue
      ? {
          standardCommission: finalPropertyValue * 0.05, // 5% standard
          referralCommission: (finalPropertyValue * 0.05) * 0.20, // 20% of standard
        }
      : null

    // Update referral status and commission details
    const updatedReferral = await prisma.agentReferral.update({
      where: { id: referralId },
      data: {
        status,
        finalPropertyValue: finalPropertyValue || undefined,
        finalCommission: finalCommission?.standardCommission,
        finalReferralCommission: finalCommission?.referralCommission,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        notes: notes ? {
          create: {
            content: notes,
            userId: session.user.id,
          }
        } : undefined,
        // Update commission tracking
        commissionTracking: {
          update: {
            status: status === 'COMPLETED' ? 'APPROVED' :
                   status === 'REJECTED' ? 'CANCELLED' :
                   'PENDING',
            finalValue: finalCommission?.standardCommission,
            referralValue: finalCommission?.referralCommission,
            completedAt: status === 'COMPLETED' ? new Date() : undefined,
          }
        },
      },
      include: {
        referrer: {
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
        property: true,
        commissionTracking: true,
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      }
    })

    // Log activity for both parties
    await prisma.$transaction([
      prisma.activityLog.create({
        data: {
          userId: session.user.id,
          type: 'REFERRAL_UPDATED',
          entityType: 'REFERRAL',
          entityId: referralId,
          description: `Referral status updated to ${status}`,
          metadata: {
            referralId,
            oldStatus: existingReferral.status,
            newStatus: status,
            finalPropertyValue,
            finalCommission: finalCommission?.standardCommission,
            finalReferralCommission: finalCommission?.referralCommission,
          },
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: session.user.id === existingReferral.referrerId
            ? existingReferral.referredAgent.id
            : existingReferral.referrer.id,
          type: 'REFERRAL_UPDATED',
          entityType: 'REFERRAL',
          entityId: referralId,
          description: `Referral status updated to ${status} by ${session.user.name}`,
          metadata: {
            referralId,
            oldStatus: existingReferral.status,
            newStatus: status,
            finalPropertyValue,
            finalCommission: finalCommission?.standardCommission,
            finalReferralCommission: finalCommission?.referralCommission,
          },
        },
      }),
    ])

    // Send notifications to both parties
    const notificationRecipient = session.user.id === updatedReferral.referrerId
      ? updatedReferral.referredAgent.id
      : updatedReferral.referrer.id

    await pusher.trigger(
      `private-user-${notificationRecipient}`,
      'referral-update',
      {
        referralId: updatedReferral.id,
        status: updatedReferral.status,
        property: updatedReferral.property,
        finalCommission: finalCommission,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json(updatedReferral)

  } catch (error) {
    console.error('[UPDATE_REFERRAL_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get referrals with comprehensive filtering and statistics
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'sent' or 'received'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const timeframe = searchParams.get('timeframe') // 'week', 'month', 'year'

    // Build date filter based on timeframe
    const dateFilter = timeframe ? {
      createdAt: {
        gte: new Date(Date.now() - {
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000,
        }[timeframe]),
      },
    } : {}

    // Build filter conditions
    const where = {
      ...(status && { status }),
      ...dateFilter,
      ...(type === 'sent' ? { referrerId: session.user.id } :
          type === 'received' ? { referredAgentId: session.user.id } :
          {
            OR: [
              { referrerId: session.user.id },
              { referredAgentId: session.user.id },
            ],
          }),
    }

    // Get referrals with related data
    const [referrals, total, stats] = await prisma.$transaction([
      // Get paginated referrals
      prisma.agentReferral.findMany({
        where,
        include: {
          referrer: {
            select: {
              name: true,
              email: true,
              agentProfile: {
                select: {
                  rating: true,
                  totalDeals: true,
                },
              },
            },
          },
          referredAgent: {
            select: {
              name: true,
              email: true,
              agentProfile: {
                select: {
                  rating: true,
                  totalDeals: true,
                },
              },
            },
          },
          property: true,
          commissionTracking: true,
          notes: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      // Get total count
      prisma.agentReferral.count({ where }),

      // Get comprehensive statistics
      prisma.agentReferral.groupBy({
        by: ['status'],
        where: {
          OR: [
            { referrerId: session.user.id },
            { referredAgentId: session.user.id },
          ],
          ...dateFilter,
        },
        _count: true,
        _sum: {
          finalCommission: true,
          finalReferralCommission: true,
        },
      }),
    ])

    // Process statistics
    const processedStats = {
      total: total,
      byStatus: stats.reduce((acc, curr) => ({
        ...acc,
        [curr.status]: {
          count: curr._count,
          commission: curr._sum.finalCommission || 0,
          referralCommission: curr._sum.finalReferralCommission || 0,
        },
      }), {}),
      totalCommission: stats.reduce((sum, curr) => 
        sum + (curr._sum.finalCommission || 0), 0),
      totalReferralCommission: stats.reduce((sum, curr) => 
        sum + (curr._sum.finalReferralCommission || 0), 0),
    }

    return NextResponse.json({
      referrals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: processedStats,
    })

  } catch (error) {
    console.error('[GET_REFERRALS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}