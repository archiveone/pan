import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

// Create service request with professional routing
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      serviceType, // PLUMBING, ELECTRICAL, CONSTRUCTION, etc.
      location,
      requirements,
      budget,
      timeline,
      urgency, // HIGH, MEDIUM, LOW
      images,
      contactPreferences,
    } = body

    // Create service request with Dublin-specific tracking
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        userId: session.user.id,
        serviceType,
        location: {
          address: location.address,
          area: location.area,
          county: 'Dublin',
          eircode: location.eircode,
          coordinates: location.coordinates,
          dublinRegion: location.dublinRegion, // North/South/Central/West Dublin
        },
        requirements,
        budget,
        timeline,
        urgency,
        images,
        contactPreferences,
        status: 'PENDING',
        currency: 'EUR',
        // Track service request activity
        activities: {
          create: {
            type: 'SERVICE_REQUESTED',
            userId: session.user.id,
            description: 'Service request created',
            metadata: {
              serviceType,
              dublinRegion: location.dublinRegion,
              urgency,
              budget,
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

    // Find qualified Dublin professionals based on service type and location
    const qualifiedProfessionals = await prisma.user.findMany({
      where: {
        role: 'PROFESSIONAL',
        isVerified: true,
        professionalProfile: {
          isActive: true,
          specializations: {
            has: serviceType,
          },
          areasServed: {
            has: location.dublinRegion,
          },
          rating: {
            gte: 4, // Minimum rating requirement
          },
          // Ensure Dublin coverage
          OR: [
            { areasServed: { has: 'Dublin' } },
            { areasServed: { has: location.dublinRegion } },
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
            businessDetails: true,
          },
        },
      },
      orderBy: [
        { professionalProfile: { rating: 'desc' } },
        { professionalProfile: { totalServices: 'desc' } },
      ],
      take: 5, // Limit to top 5 professionals
    })

    // Create leads and notifications for qualified professionals
    const professionalNotifications = qualifiedProfessionals.map(professional =>
      Promise.all([
        // Create lead
        prisma.lead.create({
          data: {
            userId: professional.id,
            title: `Service Lead - ${serviceType} in ${location.dublinRegion}`,
            type: 'SERVICE',
            status: 'NEW',
            priority: urgency,
            value: budget,
            source: 'SERVICE_REQUEST',
            currency: 'EUR',
            metadata: {
              requestId: serviceRequest.id,
              serviceType,
              location,
              timeline,
              dublinRegion: location.dublinRegion,
            },
          },
        }),
        // Create notification
        prisma.notification.create({
          data: {
            userId: professional.id,
            type: 'SERVICE_REQUEST',
            title: 'New Dublin Service Request',
            content: `${serviceType} service needed in ${location.dublinRegion}`,
            metadata: {
              requestId: serviceRequest.id,
              serviceType,
              location,
              budget,
              urgency,
              timeline,
              dublinRegion: location.dublinRegion,
            },
          },
        }),
        // Send real-time notification
        pusher.trigger(
          `private-user-${professional.id}`,
          'service-request',
          {
            requestId: serviceRequest.id,
            serviceType,
            location,
            budget,
            urgency,
            timeline,
            dublinRegion: location.dublinRegion,
            timestamp: new Date().toISOString(),
          }
        ),
      ])
    )

    await Promise.all(professionalNotifications)

    return NextResponse.json({
      success: true,
      serviceRequest: {
        id: serviceRequest.id,
        status: serviceRequest.status,
        professionalsNotified: qualifiedProfessionals.length,
      },
    })

  } catch (error) {
    console.error('[CREATE_SERVICE_REQUEST_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Submit service quote (for Dublin professionals)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      requestId,
      quote,
      availability,
      estimatedDuration,
      methodology,
      materials,
      notes,
    } = body

    // Verify Dublin professional status
    const professional = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        role: 'PROFESSIONAL',
        isVerified: true,
        professionalProfile: {
          isActive: true,
          areasServed: {
            hasSome: ['Dublin', 'North Dublin', 'South Dublin', 'Central Dublin', 'West Dublin'],
          },
        },
      },
      include: {
        professionalProfile: true,
      },
    })

    if (!professional) {
      return new NextResponse('Only verified active Dublin professionals can submit quotes', { status: 403 })
    }

    // Get service request details
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
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

    if (!serviceRequest) {
      return new NextResponse('Service request not found', { status: 404 })
    }

    // Create or update service quote
    const serviceQuote = await prisma.serviceQuote.upsert({
      where: {
        requestId_professionalId: {
          requestId,
          professionalId: session.user.id,
        },
      },
      create: {
        requestId,
        professionalId: session.user.id,
        quote,
        availability,
        estimatedDuration,
        methodology,
        materials,
        notes,
        status: 'PENDING',
        currency: 'EUR',
        activities: {
          create: {
            type: 'QUOTE_SUBMITTED',
            userId: session.user.id,
            description: 'Service quote submitted',
            metadata: {
              quote,
              estimatedDuration,
              professionalRating: professional.professionalProfile.rating,
              totalServices: professional.professionalProfile.totalServices,
              dublinExperience: professional.professionalProfile.dublinExperience,
            },
          }
        },
      },
      update: {
        quote,
        availability,
        estimatedDuration,
        methodology,
        materials,
        notes,
        status: 'UPDATED',
        activities: {
          create: {
            type: 'QUOTE_UPDATED',
            userId: session.user.id,
            description: 'Service quote updated',
            metadata: {
              quote,
              estimatedDuration,
              professionalRating: professional.professionalProfile.rating,
              totalServices: professional.professionalProfile.totalServices,
              dublinExperience: professional.professionalProfile.dublinExperience,
            },
          }
        },
      },
      include: {
        professional: {
          select: {
            name: true,
            email: true,
            professionalProfile: true,
          }
        },
      },
    })

    // Notify service requester
    await Promise.all([
      pusher.trigger(
        `private-user-${serviceRequest.userId}`,
        'service-quote',
        {
          requestId,
          professionalName: professional.name,
          professionalRating: professional.professionalProfile.rating,
          totalServices: professional.professionalProfile.totalServices,
          dublinExperience: professional.professionalProfile.dublinExperience,
          quote,
          availability,
          timestamp: new Date().toISOString(),
        }
      ),
      prisma.notification.create({
        data: {
          userId: serviceRequest.userId,
          type: 'SERVICE_QUOTE',
          title: 'New Service Quote',
          content: `${professional.name} has submitted a quote for your ${serviceRequest.serviceType.toLowerCase()} request`,
          metadata: {
            requestId,
            professionalId: professional.id,
            quote,
            professionalRating: professional.professionalProfile.rating,
            totalServices: professional.professionalProfile.totalServices,
            dublinExperience: professional.professionalProfile.dublinExperience,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      quote: serviceQuote,
    })

  } catch (error) {
    console.error('[SUBMIT_SERVICE_QUOTE_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get service requests with Dublin-specific filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const dublinRegion = searchParams.get('dublinRegion')
    const urgency = searchParams.get('urgency')
    const minBudget = searchParams.get('minBudget')
    const maxBudget = searchParams.get('maxBudget')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter conditions
    const where = {
      ...(session.user.role === 'PROFESSIONAL'
        ? {
            OR: [
              { userId: session.user.id },
              {
                quotes: {
                  some: { professionalId: session.user.id },
                },
              },
            ],
          }
        : { userId: session.user.id }
      ),
      ...(status && { status }),
      ...(serviceType && { serviceType }),
      ...(dublinRegion && {
        location: {
          path: ['dublinRegion'],
          equals: dublinRegion,
        },
      }),
      ...(urgency && { urgency }),
      ...(minBudget && { budget: { gte: parseInt(minBudget) } }),
      ...(maxBudget && { budget: { lte: parseInt(maxBudget) } }),
    }

    // Get service requests with related data
    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        quotes: {
          include: {
            professional: {
              select: {
                name: true,
                email: true,
                professionalProfile: {
                  select: {
                    rating: true,
                    totalServices: true,
                    dublinExperience: true,
                    businessDetails: true,
                  }
                },
              }
            },
          },
          orderBy: [
            { quote: 'asc' },
            { createdAt: 'desc' },
          ],
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            quotes: true,
          }
        },
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count and Dublin-specific statistics
    const [total, stats] = await prisma.$transaction([
      prisma.serviceRequest.count({ where }),
      prisma.serviceRequest.groupBy({
        by: ['status', 'serviceType', 'location'],
        where,
        _count: true,
        _avg: {
          budget: true,
          'quotes.quote': true,
        },
      }),
    ])

    return NextResponse.json({
      requests: requests.map(request => ({
        ...request,
        averageQuote: request.quotes.reduce((acc, q) => acc + q.quote, 0) / 
                      (request.quotes.length || 1),
        quoteRange: {
          min: Math.min(...request.quotes.map(q => q.quote)),
          max: Math.max(...request.quotes.map(q => q.quote)),
        },
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
            averageBudget: curr._avg.budget || 0,
            averageQuote: curr._avg['quotes.quote'] || 0,
            serviceType: curr.serviceType,
            dublinRegion: curr.location['dublinRegion'],
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_SERVICE_REQUESTS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}