import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Submit valuation bid (Verified Agents only)
export async function POST(req: Request) {
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
      marketAnalysis,
      marketingStrategy,
      additionalServices, // Optional additional services offered
      feeStructure, // Optional custom fee structure
    } = body

    // Create valuation bid with comprehensive details
    const bid = await prisma.valuationBid.create({
      data: {
        requestId,
        agentId: session.user.id,
        amount: valuationAmount,
        confidence,
        methodology,
        comparables,
        timeframe,
        marketAnalysis,
        marketingStrategy,
        additionalServices: additionalServices || [],
        feeStructure: feeStructure || null,
        status: 'PENDING',
        // Track bid activity
        activities: {
          create: {
            type: 'BID_SUBMITTED',
            userId: session.user.id,
            description: 'Valuation bid submitted',
            metadata: {
              amount: valuationAmount,
              methodology,
              confidence,
              timeframe,
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
            },
            propertyDetails: true,
          }
        },
      },
    })

    // Update agent statistics
    await prisma.agentProfile.update({
      where: { userId: session.user.id },
      data: {
        totalValuationBids: { increment: 1 },
        lastBidAt: new Date(),
      },
    })

    // Notify property owner with comprehensive bid details
    await pusher.trigger(
      `private-user-${bid.request.user.id}`,
      'valuation-bid-received',
      {
        bidId: bid.id,
        requestId: bid.requestId,
        agent: {
          name: bid.agent.name,
          rating: bid.agent.agentProfile?.rating,
          totalValuations: bid.agent.agentProfile?.totalValuations,
          successRate: bid.agent.agentProfile?.successRate,
          specializations: bid.agent.agentProfile?.specializations,
        },
        amount: bid.amount,
        confidence: bid.confidence,
        methodology: bid.methodology,
        timeframe: bid.timeframe,
        hasMarketAnalysis: !!bid.marketAnalysis,
        hasMarketingStrategy: !!bid.marketingStrategy,
        additionalServices: bid.additionalServices,
        timestamp: new Date().toISOString(),
      }
    )

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: bid.request.user.id,
        type: 'VALUATION_BID',
        title: 'New Valuation Bid Received',
        content: `${bid.agent.name} has submitted a detailed valuation bid`,
        metadata: {
          bidId: bid.id,
          requestId: bid.requestId,
          agentId: session.user.id,
          amount: bid.amount,
          agentRating: bid.agent.agentProfile?.rating,
          methodology: bid.methodology,
          timeframe: bid.timeframe,
        },
      },
    })

    // Create CRM lead for agent
    await prisma.lead.create({
      data: {
        userId: session.user.id,
        title: `Valuation Bid - ${bid.request.propertyDetails.location}`,
        status: 'NEW',
        type: 'VALUATION',
        value: valuationAmount,
        source: 'VALUATION_BID',
        notes: `Valuation bid submitted for property in ${bid.request.propertyDetails.location}`,
        metadata: {
          bidId: bid.id,
          requestId: bid.requestId,
          propertyType: bid.request.propertyDetails.propertyType,
          methodology,
          confidence,
        },
      },
    })

    return NextResponse.json({
      success: true,
      bid: {
        id: bid.id,
        status: bid.status,
        amount: bid.amount,
        createdAt: bid.createdAt,
      },
    })

  } catch (error) {
    console.error('[SUBMIT_VALUATION_BID_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update valuation bid status
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      bidId,
      status, // ACCEPTED, REJECTED, COMPLETED
      feedback,
      rating,
    } = body

    // Verify bid ownership/access
    const existingBid = await prisma.valuationBid.findUnique({
      where: { id: bidId },
      include: {
        request: {
          select: {
            userId: true,
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    })

    if (!existingBid || 
        (existingBid.request.userId !== session.user.id && 
         existingBid.agentId !== session.user.id)) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Update bid status
    const updatedBid = await prisma.valuationBid.update({
      where: { id: bidId },
      data: {
        status,
        feedback: feedback || null,
        rating: rating || null,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        // Track status change
        activities: {
          create: {
            type: 'BID_STATUS_UPDATED',
            userId: session.user.id,
            description: `Bid status updated to ${status}`,
            metadata: {
              oldStatus: existingBid.status,
              newStatus: status,
              feedback: feedback || null,
              rating: rating || null,
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
        request: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            propertyDetails: true,
          }
        },
      },
    })

    // Update agent statistics if bid is completed
    if (status === 'COMPLETED' && rating) {
      await prisma.agentProfile.update({
        where: { userId: existingBid.agentId },
        data: {
          totalCompletedValuations: { increment: 1 },
          rating: {
            set: await calculateNewRating(existingBid.agentId, rating),
          },
        },
      })
    }

    // Send notifications to relevant party
    const notificationRecipient = session.user.id === existingBid.request.userId
      ? existingBid.agent.id
      : existingBid.request.userId

    await pusher.trigger(
      `private-user-${notificationRecipient}`,
      'valuation-bid-update',
      {
        bidId: updatedBid.id,
        requestId: updatedBid.requestId,
        status: updatedBid.status,
        feedback: updatedBid.feedback,
        rating: updatedBid.rating,
        timestamp: new Date().toISOString(),
      }
    )

    // Create notification
    await prisma.notification.create({
      data: {
        userId: notificationRecipient,
        type: 'VALUATION_BID_UPDATE',
        title: getBidUpdateTitle(status),
        content: getBidUpdateContent(status, session.user.name),
        metadata: {
          bidId,
          requestId: updatedBid.requestId,
          status,
          feedback: feedback || null,
          rating: rating || null,
        },
      },
    })

    // Update CRM leads
    await updateCRMLeads(updatedBid, status)

    return NextResponse.json({
      success: true,
      bid: updatedBid,
    })

  } catch (error) {
    console.error('[UPDATE_VALUATION_BID_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Helper function to calculate new agent rating
async function calculateNewRating(agentId: string, newRating: number): Promise<number> {
  const agent = await prisma.agentProfile.findUnique({
    where: { userId: agentId },
    select: {
      rating: true,
      totalCompletedValuations: true,
    },
  })

  if (!agent) return newRating

  const totalRatings = agent.totalCompletedValuations
  const currentRating = agent.rating || 0

  // Weighted average calculation
  return ((currentRating * totalRatings) + newRating) / (totalRatings + 1)
}

// Helper function to get bid update title
function getBidUpdateTitle(status: string): string {
  switch (status) {
    case 'ACCEPTED': return 'Valuation Bid Accepted'
    case 'REJECTED': return 'Valuation Bid Rejected'
    case 'COMPLETED': return 'Valuation Completed'
    default: return 'Valuation Bid Updated'
  }
}

// Helper function to get bid update content
function getBidUpdateContent(status: string, userName: string): string {
  switch (status) {
    case 'ACCEPTED': return `${userName} has accepted your valuation bid`
    case 'REJECTED': return `${userName} has declined your valuation bid`
    case 'COMPLETED': return `${userName} has marked the valuation as completed`
    default: return `${userName} has updated the valuation bid status`
  }
}

// Helper function to update CRM leads
async function updateCRMLeads(bid: any, status: string) {
  const leadStatus = status === 'ACCEPTED' ? 'QUALIFIED' :
                    status === 'COMPLETED' ? 'WON' :
                    status === 'REJECTED' ? 'LOST' : 'NEW'

  await prisma.lead.updateMany({
    where: {
      OR: [
        {
          userId: bid.request.userId,
          metadata: {
            path: ['requestId'],
            equals: bid.requestId,
          },
        },
        {
          userId: bid.agentId,
          metadata: {
            path: ['bidId'],
            equals: bid.id,
          },
        },
      ],
    },
    data: {
      status: leadStatus,
      updatedAt: new Date(),
    },
  })
}