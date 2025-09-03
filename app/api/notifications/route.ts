import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create notification with intelligent routing (Dublin-based)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      type,
      title,
      content,
      metadata,
      routingCriteria,
    } = body

    // Handle different notification types with Dublin-focused routing
    switch (type) {
      case 'PROPERTY_SUBMISSION': {
        // Route new property to relevant Dublin-based agents
        const { propertyId, location, propertyType, priceRange } = metadata
        
        // Find matching agents with Dublin coverage
        const matchingAgents = await prisma.user.findMany({
          where: {
            role: 'AGENT',
            isVerified: true,
            agentProfile: {
              isActive: true,
              areasServed: {
                has: location.area,
              },
              specializations: {
                has: propertyType,
              },
              // Ensure agents cover Dublin areas
              OR: [
                { areasServed: { has: 'Dublin' } },
                { areasServed: { has: location.area } },
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
              },
            },
          },
        })

        // Create notifications and leads for matching agents
        const notificationPromises = matchingAgents.map(agent => 
          Promise.all([
            prisma.notification.create({
              data: {
                userId: agent.id,
                type: 'PROPERTY_LEAD',
                title: 'New Property Lead Available',
                content: `New ${propertyType} property in ${location.area}, Dublin available for agent assignment`,
                metadata: {
                  propertyId,
                  propertyType,
                  location,
                  priceRange,
                  currency: 'EUR', // Set to Euro for Dublin
                },
              },
            }),
            prisma.lead.create({
              data: {
                userId: agent.id,
                title: `Property Lead - ${propertyType} in ${location.area}, Dublin`,
                type: 'PROPERTY',
                status: 'NEW',
                source: 'PROPERTY_SUBMISSION',
                value: priceRange.max * 0.05, // 5% commission potential
                currency: 'EUR',
                metadata: {
                  propertyId,
                  propertyType,
                  location,
                  priceRange,
                  dublinRegion: location.dublinRegion,
                },
              },
            }),
            pusher.trigger(
              `private-user-${agent.id}`,
              'property-lead',
              {
                propertyId,
                propertyType,
                location,
                priceRange,
                currency: 'EUR',
                timestamp: new Date().toISOString(),
              }
            ),
          ])
        )

        await Promise.all(notificationPromises)
        return NextResponse.json({ 
          success: true,
          agentsNotified: matchingAgents.length,
        })
      }

      case 'VALUATION_REQUEST': {
        // Route valuation request to qualified Dublin agents
        const { propertyId, location, propertyType, urgency } = metadata

        // Find Dublin-based agents with valuation expertise
        const qualifiedAgents = await prisma.user.findMany({
          where: {
            role: 'AGENT',
            isVerified: true,
            agentProfile: {
              isActive: true,
              areasServed: {
                has: location.area,
              },
              totalValuations: {
                gte: 5, // Minimum valuation experience
              },
              rating: {
                gte: 4, // Minimum rating requirement
              },
              // Dublin coverage required
              OR: [
                { areasServed: { has: 'Dublin' } },
                { areasServed: { has: location.area } },
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
              },
            },
          },
          orderBy: [
            { agentProfile: { rating: 'desc' } },
            { agentProfile: { totalValuations: 'desc' } },
          ],
          take: 5, // Limit to top 5 agents
        })

        // Create notifications for qualified agents
        const notificationPromises = qualifiedAgents.map(agent =>
          Promise.all([
            prisma.notification.create({
              data: {
                userId: agent.id,
                type: 'VALUATION_REQUEST',
                title: 'New Dublin Valuation Request',
                content: `Valuation needed for ${propertyType} property in ${location.area}, Dublin`,
                metadata: {
                  propertyId,
                  propertyType,
                  location,
                  urgency,
                  currency: 'EUR',
                },
              },
            }),
            prisma.lead.create({
              data: {
                userId: agent.id,
                title: `Valuation Lead - ${propertyType} in ${location.area}, Dublin`,
                type: 'VALUATION',
                status: 'NEW',
                priority: urgency,
                source: 'VALUATION_REQUEST',
                currency: 'EUR',
                metadata: {
                  propertyId,
                  propertyType,
                  location,
                  dublinRegion: location.dublinRegion,
                },
              },
            }),
            pusher.trigger(
              `private-user-${agent.id}`,
              'valuation-request',
              {
                propertyId,
                propertyType,
                location,
                urgency,
                currency: 'EUR',
                timestamp: new Date().toISOString(),
              }
            ),
          ])
        )

        await Promise.all(notificationPromises)
        return NextResponse.json({
          success: true,
          agentsNotified: qualifiedAgents.length,
        })
      }

      case 'SERVICE_REQUEST': {
        // Route service request to Dublin-based professionals
        const { serviceType, location, budget, timeline } = metadata

        // Find matching Dublin professionals
        const matchingProfessionals = await prisma.user.findMany({
          where: {
            role: 'PROFESSIONAL',
            isVerified: true,
            professionalProfile: {
              isActive: true,
              specializations: {
                has: serviceType,
              },
              areasServed: {
                has: location.area,
              },
              // Dublin coverage required
              OR: [
                { areasServed: { has: 'Dublin' } },
                { areasServed: { has: location.area } },
              ],
            },
          },
          include: {
            professionalProfile: {
              select: {
                rating: true,
                totalServices: true,
                successRate: true,
                dublinExperience: true,
              },
            },
          },
        })

        // Create notifications for matching professionals
        const notificationPromises = matchingProfessionals.map(professional =>
          Promise.all([
            prisma.notification.create({
              data: {
                userId: professional.id,
                type: 'SERVICE_REQUEST',
                title: 'New Dublin Service Request',
                content: `${serviceType} service requested in ${location.area}, Dublin`,
                metadata: {
                  serviceType,
                  location,
                  budget,
                  timeline,
                  currency: 'EUR',
                },
              },
            }),
            prisma.lead.create({
              data: {
                userId: professional.id,
                title: `Service Lead - ${serviceType} in Dublin`,
                type: 'SERVICE',
                status: 'NEW',
                value: budget,
                currency: 'EUR',
                source: 'SERVICE_REQUEST',
                metadata: {
                  serviceType,
                  location,
                  timeline,
                  dublinRegion: location.dublinRegion,
                },
              },
            }),
            pusher.trigger(
              `private-user-${professional.id}`,
              'service-request',
              {
                serviceType,
                location,
                budget,
                timeline,
                currency: 'EUR',
                timestamp: new Date().toISOString(),
              }
            ),
          ])
        )

        await Promise.all(notificationPromises)
        return NextResponse.json({
          success: true,
          professionalsNotified: matchingProfessionals.length,
        })
      }

      default: {
        // Handle standard notifications
        const notification = await prisma.notification.create({
          data: {
            userId: session.user.id,
            type,
            title,
            content,
            metadata: {
              ...metadata,
              currency: metadata?.currency || 'EUR', // Default to Euro
            },
          },
        })

        // Send real-time notification
        await pusher.trigger(
          `private-user-${session.user.id}`,
          'notification',
          {
            id: notification.id,
            type,
            title,
            content,
            metadata: {
              ...metadata,
              currency: metadata?.currency || 'EUR',
            },
            timestamp: new Date().toISOString(),
          }
        )

        return NextResponse.json({
          success: true,
          notification,
        })
      }
    }

  } catch (error) {
    console.error('[CREATE_NOTIFICATION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Mark notifications as read
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { notificationIds } = body

    // Update notification read status
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
      data: {
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[UPDATE_NOTIFICATION_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get notifications with filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const dublinRegion = searchParams.get('dublinRegion')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build filter conditions
    const where = {
      userId: session.user.id,
      ...(type && { type }),
      ...(unreadOnly && { readAt: null }),
      ...(dublinRegion && {
        metadata: {
          path: ['dublinRegion'],
          equals: dublinRegion,
        },
      }),
    }

    // Get notifications with pagination
    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          readAt: null,
        },
      }),
    ])

    // Get comprehensive statistics
    const stats = await prisma.$transaction([
      // Unread count
      prisma.notification.count({
        where: {
          userId: session.user.id,
          readAt: null,
        },
      }),
      // Count by type
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId: session.user.id },
        _count: true,
      }),
      // Count by Dublin region
      prisma.notification.groupBy({
        by: ['metadata'],
        where: {
          userId: session.user.id,
          metadata: {
            path: ['dublinRegion'],
            not: null,
          },
        },
        _count: true,
      }),
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        unreadCount: stats[0],
        byType: stats[1],
        byDublinRegion: stats[2],
      },
    })

  } catch (error) {
    console.error('[GET_NOTIFICATIONS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}