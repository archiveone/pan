import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Create booking with Stripe integration
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      listingId,
      type, // LEISURE_RENTAL, SERVICE_APPOINTMENT, VENUE_BOOKING
      startDate,
      endDate,
      guestCount,
      specialRequirements,
      metadata,
    } = body

    // Get listing details with owner info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            professionalProfile: {
              select: {
                rating: true,
                totalServices: true,
                specializations: true,
              }
            },
          }
        },
      },
    })

    if (!listing) {
      return new NextResponse('Listing not found', { status: 404 })
    }

    // Check listing availability
    const existingBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
        ],
      },
    })

    if (existingBooking) {
      return new NextResponse('Listing not available for selected dates', { status: 400 })
    }

    // Calculate booking duration and total price
    const duration = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    )

    const totalPrice = type === 'LEISURE_RENTAL' 
      ? listing.pricePerDay * duration
      : listing.pricePerHour * (duration * 24)

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'gbp',
      metadata: {
        listingId,
        userId: session.user.id,
        type,
        duration,
      },
    })

    // Create booking with comprehensive tracking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        listingId,
        ownerId: listing.owner.id,
        type,
        status: 'PENDING',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        guestCount,
        totalPrice,
        specialRequirements,
        metadata: metadata || {},
        stripePaymentIntentId: paymentIntent.id,
        // Track booking creation
        activities: {
          create: {
            type: 'BOOKING_CREATED',
            userId: session.user.id,
            description: 'Booking created',
            metadata: {
              listingType: type,
              duration,
              totalPrice,
              specialRequirements,
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

    // Create CRM lead for listing owner
    await prisma.lead.create({
      data: {
        userId: listing.owner.id,
        title: `Booking Request from ${booking.user.name}`,
        type: 'BOOKING',
        status: 'NEW',
        value: totalPrice,
        source: type,
        notes: `${type} booking request for ${duration} days\n${specialRequirements || ''}`,
        metadata: {
          bookingId: booking.id,
          listingId,
          startDate,
          endDate,
          guestCount,
          specialRequirements,
        },
      },
    })

    // Send real-time notifications
    await Promise.all([
      // Notify listing owner
      pusher.trigger(
        `private-user-${listing.owner.id}`,
        'new-booking',
        {
          bookingId: booking.id,
          listingId,
          customerName: booking.user.name,
          type,
          startDate,
          endDate,
          totalPrice,
          specialRequirements,
          timestamp: new Date().toISOString(),
        }
      ),
      // Create notification for listing owner
      prisma.notification.create({
        data: {
          userId: listing.owner.id,
          type: 'NEW_BOOKING',
          title: 'New Booking Request',
          content: `${booking.user.name} has requested to book your ${type.toLowerCase().replace('_', ' ')}`,
          metadata: {
            bookingId: booking.id,
            listingId,
            type,
            totalPrice,
            specialRequirements,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        totalPrice,
        clientSecret: paymentIntent.client_secret,
      },
    })

  } catch (error) {
    console.error('[CREATE_BOOKING_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Update booking status with review system
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      bookingId,
      status, // CONFIRMED, CANCELLED, COMPLETED
      reviewRating,
      reviewComment,
      cancellationReason,
    } = body

    // Verify booking access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                professionalProfile: true,
              }
            },
          }
        },
        user: {
          select: {
            name: true,
            email: true,
          }
        },
      },
    })

    if (!booking || 
        (booking.userId !== session.user.id && 
         booking.ownerId !== session.user.id)) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Handle status-specific logic
    if (status === 'CANCELLED') {
      // Cancel Stripe payment intent if pending
      if (booking.status === 'PENDING') {
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId)
      }
    }

    // Update booking status with comprehensive tracking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        cancellationReason: status === 'CANCELLED' ? cancellationReason : undefined,
        // Add review if completed
        review: status === 'COMPLETED' && reviewRating ? {
          create: {
            userId: session.user.id,
            rating: reviewRating,
            comment: reviewComment,
            type: booking.type,
            metadata: {
              bookingDuration: Math.ceil(
                (booking.endDate.getTime() - booking.startDate.getTime()) / 
                (1000 * 60 * 60 * 24)
              ),
              totalPrice: booking.totalPrice,
            },
          }
        } : undefined,
        // Track status change
        activities: {
          create: {
            type: 'BOOKING_STATUS_UPDATED',
            userId: session.user.id,
            description: `Booking status updated to ${status}`,
            metadata: {
              oldStatus: booking.status,
              newStatus: status,
              reviewRating,
              cancellationReason,
            },
          }
        },
      },
    })

    // Update professional profile stats if completed with review
    if (status === 'COMPLETED' && reviewRating) {
      await prisma.professionalProfile.update({
        where: { userId: booking.listing.owner.id },
        data: {
          totalServices: { increment: 1 },
          rating: {
            increment: (reviewRating - (booking.listing.owner.professionalProfile?.rating || 0)) / 
                      ((booking.listing.owner.professionalProfile?.totalServices || 0) + 1)
          },
          successRate: {
            set: ((booking.listing.owner.professionalProfile?.totalServices || 0) + 1) /
                ((booking.listing.owner.professionalProfile?.totalServices || 0) + 
                 (booking.listing.owner.professionalProfile?.cancelledServices || 0) + 1)
          },
        },
      })
    }

    // Send notifications based on status change
    const notificationRecipient = session.user.id === booking.userId 
      ? booking.ownerId 
      : booking.userId

    await Promise.all([
      // Real-time notification
      pusher.trigger(
        `private-user-${notificationRecipient}`,
        'booking-update',
        {
          bookingId,
          status,
          updatedBy: session.user.name,
          reviewRating,
          cancellationReason,
          timestamp: new Date().toISOString(),
        }
      ),
      // Create notification
      prisma.notification.create({
        data: {
          userId: notificationRecipient,
          type: 'BOOKING_STATUS_UPDATE',
          title: `Booking ${status.toLowerCase()}`,
          content: status === 'CANCELLED'
            ? `Booking cancelled by ${session.user.name}. Reason: ${cancellationReason}`
            : `Your booking has been ${status.toLowerCase()} by ${session.user.name}`,
          metadata: {
            bookingId,
            listingId: booking.listingId,
            type: booking.type,
            status,
            reviewRating,
            cancellationReason,
          },
        },
      }),
    ])

    // Update CRM lead status
    await prisma.lead.updateMany({
      where: {
        metadata: {
          path: ['bookingId'],
          equals: bookingId,
        },
      },
      data: {
        status: status === 'CONFIRMED' ? 'QUALIFIED' :
                status === 'COMPLETED' ? 'WON' :
                status === 'CANCELLED' ? 'LOST' : 'NEW',
        notes: status === 'CANCELLED' 
          ? `Booking cancelled. Reason: ${cancellationReason}`
          : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    })

  } catch (error) {
    console.error('[UPDATE_BOOKING_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get bookings with comprehensive filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const role = searchParams.get('role') // 'customer' or 'owner'
    const dateRange = searchParams.get('dateRange') // 'upcoming', 'past', 'all'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build comprehensive filter conditions
    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(role === 'customer' 
        ? { userId: session.user.id }
        : { ownerId: session.user.id }
      ),
      ...(dateRange === 'upcoming' && {
        startDate: { gte: new Date() },
      }),
      ...(dateRange === 'past' && {
        endDate: { lt: new Date() },
      }),
      ...(search && {
        OR: [
          { listing: { title: { contains: search, mode: 'insensitive' } } },
          { specialRequirements: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    // Get bookings with comprehensive related data
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: {
            title: true,
            type: true,
            pricePerDay: true,
            pricePerHour: true,
            location: true,
            images: true,
          }
        },
        user: {
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
        review: true,
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get comprehensive statistics
    const [total, stats] = await prisma.$transaction([
      prisma.booking.count({ where }),
      prisma.booking.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: {
          totalPrice: true,
        },
        _avg: {
          guestCount: true,
        },
      }),
    ])

    return NextResponse.json({
      bookings: bookings.map(booking => ({
        ...booking,
        daysUntilStart: Math.ceil(
          (new Date(booking.startDate).getTime() - new Date().getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
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
            totalValue: curr._sum.totalPrice || 0,
            avgGuests: Math.round(curr._avg.guestCount || 0),
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_BOOKINGS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}