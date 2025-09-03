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
      type, // PROPERTY, VALUATION, SERVICE, LEISURE, REFERRAL
      title,
      source,
      value,
      priority,
      contacts,
      notes,
      metadata,
    } = body

    // Create CRM lead with Dublin region tracking
    const lead = await prisma.lead.create({
      data: {
        userId: session.user.id,
        type,
        title,
        source,
        value,
        currency: 'EUR',
        priority,
        status: 'NEW',
        notes,
        metadata: {
          ...metadata,
          dublinRegion: metadata.location?.dublinRegion || metadata.dublinRegion,
        },
        // Create associated contacts
        contacts: {
          create: contacts.map((contact: any) => ({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            metadata: {
              ...contact.metadata,
              dublinRegion: contact.location?.dublinRegion || contact.dublinRegion,
            },
          })),
        },
        // Track lead activity
        activities: {
          create: {
            type: 'LEAD_CREATED',
            userId: session.user.id,
            description: 'Lead created',
            metadata: {
              type,
              source,
              value,
              priority,
              dublinRegion: metadata.location?.dublinRegion || metadata.dublinRegion,
            },
          }
        },
      },
      include: {
        contacts: true,
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    // Create tasks if specified
    if (body.tasks) {
      const tasks = await prisma.task.createMany({
        data: body.tasks.map((task: any) => ({
          userId: session.user.id,
          leadId: lead.id,
          title: task.title,
          description: task.description,
          dueDate: new Date(task.dueDate),
          priority: task.priority,
          status: 'PENDING',
          metadata: {
            ...task.metadata,
            dublinRegion: metadata.location?.dublinRegion || metadata.dublinRegion,
          },
        })),
      })

      // Send task notifications
      await Promise.all(body.tasks.map((task: any) =>
        prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'TASK_CREATED',
            title: 'New Task Created',
            content: `Task "${task.title}" created for lead "${lead.title}"`,
            metadata: {
              leadId: lead.id,
              taskTitle: task.title,
              dueDate: task.dueDate,
              priority: task.priority,
              dublinRegion: metadata.location?.dublinRegion || metadata.dublinRegion,
            },
          },
        })
      ))
    }

    // Send real-time notification
    await pusher.trigger(
      `private-user-${session.user.id}`,
      'lead-created',
      {
        leadId: lead.id,
        type,
        title,
        value,
        priority,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      lead,
    })

  } catch (error) {
    console.error('[CREATE_CRM_LEAD_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update lead status and track progression
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      leadId,
      status, // NEW, QUALIFIED, WON, LOST
      value,
      notes,
      tasks,
      contacts,
    } = body

    // Get lead details
    const lead = await prisma.lead.findUnique({
      where: { 
        id: leadId,
        userId: session.user.id,
      },
      include: {
        contacts: true,
      },
    })

    if (!lead) {
      return new NextResponse('Lead not found', { status: 404 })
    }

    // Update lead status and track commission for property/referral leads
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        value: value || lead.value,
        notes: notes ? [...(lead.notes || []), notes] : lead.notes,
        activities: {
          create: {
            type: `LEAD_${status}`,
            userId: session.user.id,
            description: `Lead marked as ${status.toLowerCase()}`,
            metadata: {
              previousStatus: lead.status,
              newStatus: status,
              value,
              notes,
              commission: (lead.type === 'PROPERTY' || lead.type === 'REFERRAL') && status === 'WON'
                ? value * (lead.type === 'REFERRAL' ? 0.20 : 0.05) // 20% for referrals, 5% for properties
                : 0,
            },
          }
        },
      },
      include: {
        contacts: true,
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    })

    // Update or create tasks
    if (tasks) {
      await Promise.all(tasks.map((task: any) =>
        prisma.task.upsert({
          where: {
            id: task.id || 'new',
          },
          create: {
            userId: session.user.id,
            leadId,
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate),
            priority: task.priority,
            status: task.status || 'PENDING',
            metadata: task.metadata,
          },
          update: {
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate),
            priority: task.priority,
            status: task.status,
            metadata: task.metadata,
          },
        })
      ))
    }

    // Update or add contacts
    if (contacts) {
      await Promise.all(contacts.map((contact: any) =>
        prisma.contact.upsert({
          where: {
            id: contact.id || 'new',
          },
          create: {
            leadId,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            metadata: contact.metadata,
          },
          update: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            metadata: contact.metadata,
          },
        })
      ))
    }

    // Send real-time update
    await pusher.trigger(
      `private-user-${session.user.id}`,
      'lead-update',
      {
        leadId,
        status,
        value,
        commission: updatedLead.activities[0].metadata.commission,
        timestamp: new Date().toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    })

  } catch (error) {
    console.error('[UPDATE_CRM_LEAD_ERROR]', error)
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
    const dublinRegion = searchParams.get('dublinRegion')
    const minValue = searchParams.get('minValue')
    const maxValue = searchParams.get('maxValue')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter conditions
    const where = {
      userId: session.user.id,
      ...(status && { status }),
      ...(type && { type }),
      ...(source && { source }),
      ...(priority && { priority }),
      ...(dublinRegion && {
        metadata: {
          path: ['dublinRegion'],
          equals: dublinRegion,
        },
      }),
      ...(minValue && { value: { gte: parseInt(minValue) } }),
      ...(maxValue && { value: { lte: parseInt(maxValue) } }),
    }

    // Get leads with related data
    const leads = await prisma.lead.findMany({
      where,
      include: {
        contacts: true,
        tasks: {
          orderBy: {
            dueDate: 'asc',
          },
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count and statistics
    const [total, stats] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ['status', 'type', 'source'],
        where,
        _count: true,
        _sum: {
          value: true,
        },
      }),
    ])

    // Calculate task statistics and commission totals
    const [taskStats, commissionStats] = await prisma.$transaction([
      prisma.task.groupBy({
        by: ['status', 'priority'],
        where: {
          userId: session.user.id,
          lead: { 
            status: { notIn: ['WON', 'LOST'] },
          },
        },
        _count: true,
      }),
      prisma.activity.groupBy({
        by: ['type'],
        where: {
          userId: session.user.id,
          type: 'LEAD_WON',
          metadata: {
            path: ['commission'],
            gt: 0,
          },
        },
        _sum: {
          'metadata.commission': true,
        },
      }),
    ])

    return NextResponse.json({
      leads: leads.map(lead => ({
        ...lead,
        completedTasks: lead.tasks.filter(t => t.status === 'COMPLETED').length,
        pendingTasks: lead.tasks.filter(t => t.status === 'PENDING').length,
        nextTask: lead.tasks.find(t => t.status === 'PENDING'),
        totalCommission: lead.activities
          .filter(a => a.type === 'LEAD_WON')
          .reduce((sum, a) => sum + (a.metadata.commission || 0), 0),
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
            totalValue: curr._sum.value || 0,
            type: curr.type,
            source: curr.source,
          },
        }), {}),
        tasks: taskStats.reduce((acc, curr) => ({
          ...acc,
          [`${curr.status}_${curr.priority}`]: curr._count,
        }), {}),
        commissions: {
          total: commissionStats.reduce((sum, stat) => 
            sum + (stat._sum['metadata.commission'] || 0), 0),
          byType: commissionStats.reduce((acc, curr) => ({
            ...acc,
            [curr.type]: curr._sum['metadata.commission'] || 0,
          }), {}),
        },
      },
    })

  } catch (error) {
    console.error('[GET_CRM_LEADS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}