import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create CRM lead with source tracking
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      title,
      type, // PROPERTY, SERVICE, LEISURE, REFERRAL, GENERAL
      source, // PROPERTY_SUBMISSION, VALUATION_REQUEST, AGENT_REFERRAL, MANUAL, etc.
      value,
      priority, // HIGH, MEDIUM, LOW
      status = 'NEW',
      assignedTo,
      dueDate,
      notes,
      metadata,
      tags,
    } = body

    // Create lead with comprehensive tracking
    const lead = await prisma.lead.create({
      data: {
        userId: session.user.id,
        title,
        type,
        source,
        value,
        priority: priority || 'MEDIUM',
        status,
        assignedTo,
        dueDate,
        notes,
        metadata: metadata || {},
        tags: tags || [],
        // Track lead creation
        activities: {
          create: {
            type: 'LEAD_CREATED',
            userId: session.user.id,
            description: 'Lead created',
            metadata: {
              leadType: type,
              source,
              value,
              priority,
            },
          }
        },
        // Create initial task if due date provided
        tasks: dueDate ? {
          create: {
            title: `Follow up on ${title}`,
            dueDate,
            priority: priority || 'MEDIUM',
            status: 'PENDING',
            assignedTo,
            userId: session.user.id,
          }
        } : undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        assignedUser: assignedTo ? {
          select: {
            name: true,
            email: true,
          }
        } : false,
      },
    })

    // Notify assigned user if any
    if (assignedTo) {
      await pusher.trigger(
        `private-user-${assignedTo}`,
        'lead-assigned',
        {
          leadId: lead.id,
          title: lead.title,
          type: lead.type,
          value: lead.value,
          priority: lead.priority,
          assignedBy: session.user.name,
          dueDate: lead.dueDate,
          timestamp: new Date().toISOString(),
        }
      )

      // Create notification for assigned user
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          type: 'LEAD_ASSIGNED',
          title: 'New Lead Assigned',
          content: `${session.user.name} has assigned you a ${type.toLowerCase()} lead: ${title}`,
          metadata: {
            leadId: lead.id,
            leadType: type,
            value,
            priority,
            dueDate,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        title: lead.title,
        status: lead.status,
        createdAt: lead.createdAt,
      },
    })

  } catch (error) {
    console.error('[CREATE_LEAD_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update lead status and details
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      leadId,
      status,
      priority,
      value,
      assignedTo,
      dueDate,
      notes,
      tags,
      metadata,
    } = body

    // Verify lead access
    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    })

    if (!existingLead || 
        (existingLead.userId !== session.user.id && 
         existingLead.assignedTo !== session.user.id)) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Update lead with tracking
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        priority,
        value,
        assignedTo,
        dueDate,
        notes: notes || undefined,
        tags: tags || undefined,
        metadata: metadata || undefined,
        // Track status change
        activities: {
          create: {
            type: 'LEAD_UPDATED',
            userId: session.user.id,
            description: `Lead ${status ? 'status updated to ' + status : 'updated'}`,
            metadata: {
              oldStatus: existingLead.status,
              newStatus: status,
              oldValue: existingLead.value,
              newValue: value,
              oldAssignee: existingLead.assignedTo,
              newAssignee: assignedTo,
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
        assignedUser: assignedTo ? {
          select: {
            name: true,
            email: true,
          }
        } : false,
      },
    })

    // Handle notifications for status changes and assignments
    if (status && status !== existingLead.status) {
      // Notify lead owner if not the updater
      if (existingLead.userId !== session.user.id) {
        await pusher.trigger(
          `private-user-${existingLead.userId}`,
          'lead-status-update',
          {
            leadId,
            oldStatus: existingLead.status,
            newStatus: status,
            updatedBy: session.user.name,
            timestamp: new Date().toISOString(),
          }
        )

        await prisma.notification.create({
          data: {
            userId: existingLead.userId,
            type: 'LEAD_STATUS_UPDATE',
            title: 'Lead Status Updated',
            content: `${session.user.name} updated lead status to ${status}`,
            metadata: {
              leadId,
              oldStatus: existingLead.status,
              newStatus: status,
            },
          },
        })
      }
    }

    // Handle new assignment notifications
    if (assignedTo && assignedTo !== existingLead.assignedTo) {
      await pusher.trigger(
        `private-user-${assignedTo}`,
        'lead-assigned',
        {
          leadId,
          title: updatedLead.title,
          type: updatedLead.type,
          value: updatedLead.value,
          priority: updatedLead.priority,
          assignedBy: session.user.name,
          dueDate: updatedLead.dueDate,
          timestamp: new Date().toISOString(),
        }
      )

      await prisma.notification.create({
        data: {
          userId: assignedTo,
          type: 'LEAD_ASSIGNED',
          title: 'Lead Reassigned to You',
          content: `${session.user.name} has assigned you a lead: ${updatedLead.title}`,
          metadata: {
            leadId,
            leadType: updatedLead.type,
            value: updatedLead.value,
            priority: updatedLead.priority,
            dueDate: updatedLead.dueDate,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    })

  } catch (error) {
    console.error('[UPDATE_LEAD_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get leads with comprehensive filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const source = searchParams.get('source')
    const priority = searchParams.get('priority')
    const assigned = searchParams.get('assigned') // 'tome', 'byme', 'unassigned'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build comprehensive filter conditions
    const where = {
      OR: [
        { userId: session.user.id },
        { assignedTo: session.user.id },
      ],
      ...(status && { status }),
      ...(type && { type }),
      ...(source && { source }),
      ...(priority && { priority }),
      ...(assigned === 'tome' && { assignedTo: session.user.id }),
      ...(assigned === 'byme' && { 
        userId: session.user.id,
        assignedTo: { not: null },
      }),
      ...(assigned === 'unassigned' && { assignedTo: null }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
    }

    // Get leads with related data
    const leads = await prisma.lead.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        assignedUser: {
          select: {
            name: true,
            email: true,
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        tasks: {
          where: {
            status: 'PENDING',
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
        _count: {
          select: {
            activities: true,
            tasks: true,
          }
        },
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get comprehensive statistics
    const [total, stats] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: {
          value: true,
        },
      }),
    ])

    return NextResponse.json({
      leads: leads.map(lead => ({
        ...lead,
        activityScore: calculateLeadActivityScore(lead),
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
            value: curr._sum.value || 0,
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_LEADS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Helper function to calculate lead activity score
function calculateLeadActivityScore(lead: any): number {
  const now = new Date()
  const leadAge = now.getTime() - new Date(lead.createdAt).getTime()
  const daysOld = leadAge / (1000 * 60 * 60 * 24)

  // Base score from activities and tasks
  let score = (lead._count.activities * 2) + 
              (lead._count.tasks * 3)

  // Priority bonus
  if (lead.priority === 'HIGH') score *= 1.5
  if (lead.priority === 'MEDIUM') score *= 1.2

  // Recent activity bonus
  const lastActivity = lead.activities[0]
  if (lastActivity) {
    const daysSinceActivity = 
      (now.getTime() - new Date(lastActivity.createdAt).getTime()) / 
      (1000 * 60 * 60 * 24)
    if (daysSinceActivity <= 1) score *= 1.3
    else if (daysSinceActivity <= 3) score *= 1.2
    else if (daysSinceActivity <= 7) score *= 1.1
  }

  // Value-based bonus
  if (lead.value) {
    score *= (1 + Math.min(0.5, lead.value / 10000))
  }

  return Math.round(score)
}