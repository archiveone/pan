import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      // Common fields for all listing types
      title,
      description,
      price,
      location,
      postcode,
      category, // PROPERTY, SERVICE, LEISURE
      images,
      visibility,
      availability,
      tags,
      
      // Property specific fields
      propertyType,
      bedrooms,
      bathrooms,
      size,
      features,
      amenities,
      floorPlan,
      documents,
      listingType, // SALE, RENT, AUCTION
      availableFrom,
      minimumTerm,
      maximumTerm,
      deposit,
      furnished,
      petsAllowed,
      parkingAvailable,
      epcRating,
      councilTax,
      propertyTenure,
      leaseYearsRemaining,
      groundRent,
      serviceFee,

      // Service specific fields
      serviceType,
      expertise,
      qualifications,
      insurance,
      serviceAreas,
      availability: serviceAvailability,
      pricing: servicePricing, // hourly, fixed, quote
      minimumBooking,
      cancellationPolicy,

      // Leisure specific fields
      leisureType, // RENTAL, EXPERIENCE, VENUE
      capacity,
      duration,
      included,
      requirements,
      restrictions,
      cancellationTerms,
      bookingNotice,
      seasonalPricing,
      availableSlots,
    } = body;

    // Validate required fields
    if (!title || !description || !price || !location || !postcode || !category || !images?.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create base listing
    const listing = await prismadb.listing.create({
      data: {
        title,
        description,
        price,
        location,
        postcode,
        category,
        images,
        visibility,
        availability,
        tags,
        status: 'ACTIVE',
        userId: session.user.id,
      }
    });

    // Handle category-specific data
    switch (category) {
      case 'PROPERTY':
        await prismadb.propertyListing.create({
          data: {
            listingId: listing.id,
            propertyType,
            bedrooms,
            bathrooms,
            size,
            features,
            amenities,
            floorPlan,
            documents,
            listingType,
            availableFrom,
            minimumTerm,
            maximumTerm,
            deposit,
            furnished,
            petsAllowed,
            parkingAvailable,
            epcRating,
            councilTax,
            propertyTenure,
            leaseYearsRemaining,
            groundRent,
            serviceFee,
          }
        });
        break;

      case 'SERVICE':
        await prismadb.serviceListing.create({
          data: {
            listingId: listing.id,
            serviceType,
            expertise,
            qualifications,
            insurance,
            serviceAreas,
            availability: serviceAvailability,
            pricing: servicePricing,
            minimumBooking,
            cancellationPolicy,
          }
        });
        break;

      case 'LEISURE':
        await prismadb.leisureListing.create({
          data: {
            listingId: listing.id,
            leisureType,
            capacity,
            duration,
            included,
            requirements,
            restrictions,
            cancellationTerms,
            bookingNotice,
            seasonalPricing,
            availableSlots,
          }
        });
        break;
    }

    // If visibility is private, create private listing
    if (visibility === 'PRIVATE') {
      const privateListing = await prismadb.privateListing.create({
        data: {
          status: 'PENDING',
          listingId: listing.id,
          userId: session.user.id,
        }
      });

      // Find relevant professionals based on category and location
      const professionals = await prismadb.user.findMany({
        where: {
          role: category === 'PROPERTY' ? 'AGENT' : 'PROFESSIONAL',
          verificationStatus: 'VERIFIED',
          serviceAreas: {
            has: postcode.substring(0, 4)
          },
          ...(category === 'SERVICE' && {
            expertise: {
              hasSome: tags
            }
          })
        },
        select: {
          id: true,
          email: true,
          name: true,
        }
      });

      // Notify matched professionals
      for (const professional of professionals) {
        await pusherServer.trigger(`private-user-${professional.id}`, 'new-private-listing', {
          message: `New private ${category.toLowerCase()} listing in your area: ${title}`,
          listingId: privateListing.id,
        });

        await prismadb.notification.create({
          data: {
            userId: professional.id,
            type: 'PRIVATE_LISTING',
            title: 'New Private Listing',
            content: `New ${category.toLowerCase()} available in ${location}: ${title}`,
            link: `/private-marketplace/${privateListing.id}`,
          }
        });
      }
    }

    // Create social post if public
    if (visibility === 'PUBLIC') {
      await prismadb.post.create({
        data: {
          content: `New ${category.toLowerCase()} in ${location}: ${title}\n\n${description}`,
          images: images.slice(0, 4),
          userId: session.user.id,
          listingId: listing.id,
        }
      });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('[LISTING_CREATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const tags = searchParams.get('tags')?.split(',');
    const cursor = searchParams.get('cursor');
    const limit = 12;

    // Build where clause
    const where = {
      ...(userId && { userId }),
      ...(category && { category }),
      ...(type && {
        OR: [
          { propertyListing: { propertyType: type } },
          { serviceListing: { serviceType: type } },
          { leisureListing: { leisureType: type } },
        ]
      }),
      ...(location && {
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { postcode: { contains: location, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(tags && { tags: { hasSome: tags } }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      visibility: 'PUBLIC',
    };

    // Get listings with pagination
    const listings = await prismadb.listing.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
          }
        },
        propertyListing: true,
        serviceListing: true,
        leisureListing: true,
        _count: {
          select: {
            favorites: true,
            views: true,
            bookings: true,
          }
        }
      }
    });

    // Get next cursor
    const nextCursor = listings.length === limit
      ? listings[listings.length - 1].createdAt.toISOString()
      : null;

    // Get total count for pagination
    const total = await prismadb.listing.count({ where });

    return NextResponse.json({
      listings,
      nextCursor,
      total,
    });
  } catch (error) {
    console.error('[LISTINGS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}