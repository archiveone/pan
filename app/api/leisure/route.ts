import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Create leisure listing (rentals/experiences)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      type, // RENTAL (car/boat/venue) or EXPERIENCE (gig/tour/dining)
      title,
      description,
      location,
      pricing,
      availability,
      capacity,
      specifications,
      images,
      amenities,
      requirements,
      cancellationPolicy,
    } = body

    // Verify business account status for Dublin operations
    const provider = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        isVerified: true,
        businessProfile: {
          isActive: true,
          areasServed: {
            hasSome: ['Dublin', 'North Dublin', 'South Dublin', 'Central Dublin', 'West Dublin'],
          },
          verificationStatus: 'VERIFIED',
        },
      },
      include: {
        businessProfile: true,
      },
    })

    if (!provider) {
      return new NextResponse('Only verified Dublin-based businesses can create leisure listings', { status: 403 })
    }

    // Create Stripe product and price for EUR payments
    const stripeProduct = await stripe.products.create({
      name: title,
      description,
      metadata: {
        type,
        providerId: session.user.id,
        dublinRegion: location.dublinRegion,
      },
    })

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: pricing.basePrice * 100, // Convert to cents
      currency: 'eur',
      recurring: pricing.type === 'HOURLY' ? { interval: 'hour' } :
                pricing.type === 'DAILY' ? { interval: 'day' } : undefined,
    })

    // Create leisure listing with Dublin-specific tracking
    const listing = await prisma.leisureListing.create({
      data: {
        providerId: session.user.id,
        type,
        title,
        description,
        location: {
          address: location.address,
          area: location.area,
          county: 'Dublin',
          eircode: location.eircode,
          coordinates: location.coordinates,
          dublinRegion: location.dublinRegion,
        },
        pricing: {
          ...pricing,
          currency: 'EUR',
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
        },
        availability,
        capacity,
        specifications,
        images,
        amenities,
        requirements,
        cancellationPolicy,
        status: 'ACTIVE',
        // Track listing activity
        activities: {
          create: {
            type: 'LISTING_CREATED',
            userId: session.user.id,
            description: 'Dublin leisure listing created',
            metadata: {
              type,
              dublinRegion: location.dublinRegion,
              pricing,
              capacity,
            },
          }
        },
      },
      include: {
        provider: {
          select: {
            name: true,
            email: true,
            businessProfile: true,
          }
        },
      },
    })

    // Create CRM lead for tracking
    await prisma.lead.create({
      data: {
        userId: session.user.id,
        title: `New Dublin ${type} Listing - ${title}`,
        type: 'LEISURE_LISTING',
        status: 'ACTIVE',
        source: 'LEISURE_PLATFORM',
        value: pricing.basePrice,
        currency: 'EUR',
        metadata: {
          listingId: listing.id,
          type,
          dublinRegion: location.dublinRegion,
          pricing,
        },
      },
    })

    return NextResponse.json({
      success: true,
      listing,
    })

  } catch (error) {
    console.error('[CREATE_LEISURE_LISTING_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Book leisure listing with payment processing
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      listingId,
      startTime,
      endTime,
      participants,
      specialRequests,
    } = body

    // Get listing details with Dublin verification
    const listing = await prisma.leisureListing.findUnique({
      where: {
        id: listingId,
        location: {
          path: ['county'],
          equals: 'Dublin',
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            businessProfile: true,
          }
        },
      },
    })

    if (!listing) {
      return new NextResponse('Dublin listing not found', { status: 404 })
    }

    // Check availability
    const existingBookings = await prisma.leisureBooking.count({
      where: {
        listingId,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
        ],
      },
    })

    if (existingBookings > 0) {
      return new NextResponse('Selected time slot is not available', { status: 400 })
    }

    // Calculate duration and total price in EUR
    const duration = Math.ceil(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) /
      (listing.pricing.type === 'HOURLY' ? 3600000 : 86400000)
    )
    
    const totalPrice = listing.pricing.basePrice * duration +
      (listing.pricing.participantFee || 0) * participants.length

    // Create Stripe payment intent in EUR
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert to cents
      currency: 'eur',
      customer_email: session.user.email!,
      metadata: {
        listingId,
        userId: session.user.id,
        providerId: listing.providerId,
        type: listing.type,
        duration,
        participants: participants.length,
        dublinRegion: listing.location.dublinRegion,
      },
    })

    // Create booking with Dublin tracking
    const booking = await prisma.leisureBooking.create({
      data: {
        listingId,
        userId: session.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        participants,
        specialRequests,
        totalPrice,
        currency: 'EUR',
        status: 'PENDING',
        paymentIntentId: paymentIntent.id,
        activities: {
          create: {
            type: 'BOOKING_CREATED',
            userId: session.user.id,
            description: 'Dublin leisure booking created',
            metadata: {
              listingType: listing.type,
              duration,
              totalPrice,
              participants: participants.length,
              dublinRegion: listing.location.dublinRegion,
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
        listing: {
          include: {
            provider: {
              select: {
                name: true,
                email: true,
                businessProfile: true,
              }
            },
          }
        },
      },
    })

    // Create CRM leads for tracking
    await Promise.all([
      // Lead for customer
      prisma.lead.create({
        data: {
          userId: session.user.id,
          title: `Booking - ${listing.title}`,
          type: 'LEISURE_BOOKING',
          status: 'PENDING',
          value: totalPrice,
          currency: 'EUR',
          source: 'LEISURE_PLATFORM',
          metadata: {
            bookingId: booking.id,
            listingType: listing.type,
            duration,
            dublinRegion: listing.location.dublinRegion,
          },
        },
      }),
      // Lead for provider
      prisma.lead.create({
        data: {
          userId: listing.providerId,
          title: `Booking Request - ${listing.title}`,
          type: 'LEISURE_BOOKING',
          status: 'NEW',
          value: totalPrice,
          currency: 'EUR',
          source: 'LEISURE_PLATFORM',
          metadata: {
            bookingId: booking.id,
            listingType: listing.type,
            duration,
            participants: participants.length,
            dublinRegion: listing.location.dublinRegion,
          },
        },
      }),
    ])

    // Send notifications
    await Promise.all([
      pusher.trigger(
        `private-user-${listing.providerId}`,
        'booking-request',
        {
          bookingId: booking.id,
          listingTitle: listing.title,
          customerName: session.user.name,
          startTime,
          endTime,
          totalPrice,
          dublinRegion: listing.location.dublinRegion,
          timestamp: new Date().toISOString(),
        }
      ),
      prisma.notification.create({
        data: {
          userId: listing.providerId,
          type: 'BOOKING_REQUEST',
          title: 'New Dublin Booking Request',
          content: `${session.user.name} has requested to book ${listing.title}`,
          metadata: {
            bookingId: booking.id,
            listingType: listing.type,
            duration,
            totalPrice,
            participants: participants.length,
            dublinRegion: listing.location.dublinRegion,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      booking,
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('[CREATE_LEISURE_BOOKING_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Get leisure listings with Dublin-specific filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const dublinRegion = searchParams.get('dublinRegion')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minCapacity = searchParams.get('minCapacity')
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build filter conditions for Dublin listings
    const where = {
      status: 'ACTIVE',
      location: {
        path: ['county'],
        equals: 'Dublin',
      },
      ...(type && { type }),
      ...(dublinRegion && {
        location: {
          path: ['dublinRegion'],
          equals: dublinRegion,
        },
      }),
      ...(minPrice && {
        pricing: {
          path: ['basePrice'],
          gte: parseInt(minPrice),
        },
      }),
      ...(maxPrice && {
        pricing: {
          path: ['basePrice'],
          lte: parseInt(maxPrice),
        },
      }),
      ...(minCapacity && { capacity: { gte: parseInt(minCapacity) } }),
    }

    // Get listings with related data
    const listings = await prisma.leisureListing.findMany({
      where,
      include: {
        provider: {
          select: {
            name: true,
            email: true,
            businessProfile: {
              select: {
                rating: true,
                totalBookings: true,
                dublinExperience: true,
                businessDetails: true,
              }
            },
          }
        },
        bookings: date ? {
          where: {
            startTime: {
              gte: new Date(date),
              lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
            },
            status: 'CONFIRMED',
          },
          select: {
            startTime: true,
            endTime: true,
          },
        } : false,
        reviews: {
          select: {
            rating: true,
            comment: true,
            user: {
              select: {
                name: true,
              }
            },
          },
          take: 3,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          }
        },
      },
      orderBy: [
        { pricing: { path: ['basePrice'], order: 'asc' } },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count and Dublin-specific statistics
    const [total, stats] = await prisma.$transaction([
      prisma.leisureListing.count({ where }),
      prisma.leisureListing.groupBy({
        by: ['type', 'location'],
        where,
        _count: true,
        _avg: {
          'pricing.basePrice': true,
          capacity: true,
          'reviews.rating': true,
        },
      }),
    ])

    return NextResponse.json({
      listings: listings.map(listing => ({
        ...listing,
        availability: date ? {
          date,
          bookedSlots: listing.bookings.map(b => ({
            start: b.startTime,
            end: b.endTime,
          })),
        } : listing.availability,
        averageRating: listing.reviews.reduce((acc, r) => acc + r.rating, 0) / 
                      (listing.reviews.length || 1),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        byType: stats.reduce((acc, curr) => ({
          ...acc,
          [curr.type]: {
            count: curr._count,
            averagePrice: curr._avg['pricing.basePrice'] || 0,
            averageCapacity: curr._avg.capacity || 0,
            averageRating: curr._avg['reviews.rating'] || 0,
            dublinRegion: curr.location['dublinRegion'],
          },
        }), {}),
      },
    })

  } catch (error) {
    console.error('[GET_LEISURE_LISTINGS_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}