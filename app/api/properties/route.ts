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
      title,
      description,
      price,
      location,
      postcode,
      type,
      category,
      features,
      amenities,
      size,
      bedrooms,
      bathrooms,
      images,
      floorPlan,
      documents,
      visibility,
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
      propertyTenure, // FREEHOLD, LEASEHOLD
      leaseYearsRemaining,
      groundRent,
      serviceFee,
    } = body;

    // Validate required fields
    if (!title || !price || !location || !postcode || !type || !category || !images?.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create property
    const property = await prismadb.property.create({
      data: {
        title,
        description,
        price,
        location,
        postcode,
        type,
        category,
        features,
        amenities,
        size,
        bedrooms,
        bathrooms,
        images,
        floorPlan,
        documents,
        visibility,
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
        status: 'ACTIVE',
        userId: session.user.id,
      }
    });

    // Create listing
    const listing = await prismadb.listing.create({
      data: {
        title,
        description,
        price,
        type: listingType,
        status: 'ACTIVE',
        userId: session.user.id,
        propertyId: property.id,
      }
    });

    // If visibility is private, create private listing
    if (visibility === 'PRIVATE') {
      const privateListing = await prismadb.privateListing.create({
        data: {
          status: 'PENDING',
          propertyId: property.id,
          userId: session.user.id,
        }
      });

      // Find agents in the area
      const areaAgents = await prismadb.user.findMany({
        where: {
          role: 'AGENT',
          verificationStatus: 'VERIFIED',
          serviceAreas: {
            has: postcode.substring(0, 4) // Match first part of postcode
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
        }
      });

      // Notify matched agents
      for (const agent of areaAgents) {
        await pusherServer.trigger(`private-user-${agent.id}`, 'new-private-listing', {
          message: `New private listing in your area: ${title}`,
          propertyId: property.id,
          listingId: privateListing.id,
        });

        // Create notification
        await prismadb.notification.create({
          data: {
            userId: agent.id,
            type: 'PRIVATE_LISTING',
            title: 'New Private Listing',
            content: `New property available in ${location}: ${title}`,
            link: `/private-marketplace/${privateListing.id}`,
          }
        });
      }
    }

    // Create social post if public
    if (visibility === 'PUBLIC') {
      await prismadb.post.create({
        data: {
          content: `New ${listingType.toLowerCase()} property in ${location}: ${title}\n\n${description}`,
          images: images.slice(0, 4), // First 4 images
          userId: session.user.id,
          propertyId: property.id,
          listingId: listing.id,
        }
      });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('[PROPERTY_CREATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const listingType = searchParams.get('listingType');
    const bedrooms = searchParams.get('bedrooms');
    const cursor = searchParams.get('cursor');
    const limit = 12;

    // Build where clause
    const where = {
      ...(userId && { userId }),
      ...(type && { type }),
      ...(category && { category }),
      ...(location && {
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { postcode: { contains: location, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(listingType && { listingType }),
      ...(bedrooms && { bedrooms: parseInt(bedrooms) }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      visibility: 'PUBLIC', // Only public properties
    };

    // Get properties with pagination
    const properties = await prismadb.property.findMany({
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
          }
        },
        listing: {
          select: {
            id: true,
            status: true,
            type: true,
          }
        },
        _count: {
          select: {
            favorites: true,
            views: true,
          }
        }
      }
    });

    // Get next cursor
    const nextCursor = properties.length === limit
      ? properties[properties.length - 1].createdAt.toISOString()
      : null;

    // Get total count for pagination
    const total = await prismadb.property.count({ where });

    return NextResponse.json({
      properties,
      nextCursor,
      total,
    });
  } catch (error) {
    console.error('[PROPERTIES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}