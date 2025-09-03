import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create new lead with real-time notifications
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { title, contactId, value, source, notes, type } = body

    // Create new lead with proper tracking
    const lead = await prisma.lead.create({
      data: {
        title,
        status: 'NEW',
        value: value || null,
        source: source || 'MANUAL',
        notes: notes || null,
        type: type || 'GENERAL', // PROPERTY, SERVICE, LEISURE, GENERAL
        userId: session.user.id,
        contactId,
        // Add commission tracking for property leads
        commissionDetails: type === 'PROPERTY' ? {
          create: {
            percentage: 5, // 5% standard commission
            status: 'PENDING',
            referralSplit: 20, // 20% referral split if applicable
          }
        } : undefined,
      },
      include: {
        contact: true,
        commissionDetails: true,
      },
    })

    // Create activity log for tracking
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'LEAD_CREATED',
        entityType: 'LEAD',
        entityId: lead.id,
        description: `New ${type?.toLowerCase() || 'general'} lead created: ${lead.title}`,
        metadata: {
          leadId: lead.id,
          contactId: lead.contactId,
          status: lead.status,
          value: lead.value,
          type: type,
          hasCommission: !!lead.commissionDetails,
        },
      },
    })

    // Send real-time notification
    await pusher.trigger(
      `private-user-${session.user.id}`,
      'crm-update',
      {
        type: 'LEAD_CREATED',
        lead,
        timestamp: new Date().toISOString(),
      }
    )

    // If it's a property lead, notify relevant agents
    if (type === 'PROPERTY' && lead.commissionDetails) {
      // Find verified agents in the area
      const areaAgents = await prisma.user.findMany({
        where: {
          role: 'AGENT',
          isVerified: true,
          // TODO: Add area-based filtering
        },
      })

      // Notify agents about new property lead
      for (const agent of areaAgents) {
        await pusher.trigger(
          `private-user-${agent.id}`,
          'new-property-lead',
          {
            leadId: lead.id,
            title: lead.title,
            value: lead.value,
            commission: lead.commissionDetails.percentage,
            timestamp: new Date().toISOString(),
          }
        )
      }
    }

    return NextResponse.json(lead)

  } catch (error) {
    console.error('[CREATE_LEAD_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update lead status with commission tracking
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { leadId, status, notes, assignedAgentId } = body

    // Verify lead ownership
    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        commissionDetails: true,
      },
    })

    if (!existingLead || existingLead.userId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Update lead with commission tracking
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        assignedAgentId,
        notes: notes ? {
          create: {
            content: notes,
            userId: session.user.id,
          }
        } : undefined,
        // Update commission status if lead is won/lost
        commissionDetails: existingLead.commissionDetails ? {
          update: {
            status: status === 'WON' ? 'APPROVED' : 
                   status === 'LOST' ? 'CANCELLED' : 
                   'PENDING',
          }
        } : undefined,
      },
      include: {
        contact: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        commissionDetails: true,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'LEAD_UPDATED',
        entityType: 'LEAD',
        entityId: leadId,
        description: `Lead status updated to ${status}${assignedAgentId ? ' and assigned to agent' : ''}`,
        metadata: {
          leadId,
          oldStatus: existingLead.status,
          newStatus: status,
          assignedAgentId,
          commissionStatus: updatedLead.commissionDetails?.status,
        },
      },
    })

    // Send real-time notifications
    await pusher.trigger(
      `private-user-${session.user.id}`,
      'crm-update',
      {
        type: 'LEAD_UPDATED',
        lead: updatedLead,
        timestamp: new Date().toISOString(),
      }
    )

    // Notify assigned agent if applicable
    if (assignedAgentId) {
      await pusher.trigger(
        `private-user-${assignedAgentId}`,
        'lead-assignment',
        {
          leadId: updatedLead.id,
          title: updatedLead.title,
          value: updatedLead.value,
          commission: updatedLead.commissionDetails?.percentage,
          timestamp: new Date().toISOString(),
        }
      )
    }

    return NextResponse.json(updatedLead)

  } catch (error) {
    console.error('[UPDATE_LEAD_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get leads with filtering, pagination, and commission tracking
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const hasCommission = searchParams.get('hasCommission') === 'true'

    // Build filter conditions
    const where = {
      OR: [
        { userId: session.user.id },
        { assignedAgentId: session.user.id },
      ],
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { contact: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(hasCommission && {
        commissionDetails: {
          isNot: null,
        },
      }),
    }

    // Get leads with pagination
    const leads = await prisma.lead.findMany({
      where,
      include: {
        contact: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        commissionDetails: true,
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.lead.count({ where })

    // Calculate commission statistics if user is an agent
    let commissionStats = null
    if (session.user.role === 'AGENT') {
      const agentLeads = await prisma.lead.findMany({
        where: {
          assignedAgentId: session.user.id,
          commissionDetails: {
            isNot: null,
          },
        },
        include: {
          commissionDetails: true,
        },
      })

      commissionStats = {
        totalLeads: agentLeads.length,
        pendingCommission: agentLeads.filter(l => l.commissionDetails?.status === 'PENDING').length,
        approvedCommission: agentLeads.filter(l => l.commissionDetails?.status === 'APPROVED').length,
        totalValue: agentLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
      }
    }

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      commissionStats,
    })

  } catch (error) {
    console.error('[GET_LEADS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}