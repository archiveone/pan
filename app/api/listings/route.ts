import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ListingType } from '@/types/listing';

// GET /api/listings - Get listings with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const type = searchParams.get('type') as ListingType;
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status');
    const verified = searchParams.get('verified');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build filter conditions
    const where: any = {
      status: 'ACTIVE', // Default to active listings
    };

    if (type) where.type = type;
    if (category) {
      if (type === 'PROPERTY') where.propertyType = category;
      if (type === 'SERVICE') where.serviceType = category;
      if (type === 'LEISURE') where.leisureType = category;
    }
    if (city) where.city = city;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (status) where.status = status;
    if (verified) where.verified = verified === 'true';
    if (featured) where.featured = featured === 'true';

    // Get total count for pagination
    const total = await prisma.listing.count({ where });

    // Get listings with pagination and sorting
    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            verified: true,
            agentProfile: {
              select: {
                id: true,
                company: true,
                kycVerified: true,
              },
            },
          },
        },
        media: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: {
            savedBy: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        [sort]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Listings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create a new listing
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      type,
      title,
      description,
      location,
      price,
      features,
      amenities,
      rules,
      media,
      ...specificFields
    } = body;

    // Validate required fields
    if (!type || !title || !description || !location || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is verified for property listings
    if (type === 'PROPERTY') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { agentProfile: true },
      });

      if (!user?.agentProfile?.kycVerified) {
        return NextResponse.json(
          { error: 'Agent verification required to create property listings' },
          { status: 403 }
        );
      }
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        type,
        title,
        description,
        status: 'PENDING',
        ...location,
        price: price.amount,
        currency: price.currency,
        period: price.period,
        negotiable: price.negotiable,
        minimumStay: price.minimumStay,
        features,
        amenities,
        rules,
        userId: session.user.id,
        ...specificFields,
      },
    });

    // Create media records if provided
    if (media?.length) {
      await prisma.listingMedia.createMany({
        data: media.map((m: any, index: number) => ({
          listingId: listing.id,
          ...m,
          order: index,
        })),
      });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Listing creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings - Bulk update listings
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ids, updates } = body;

    if (!ids?.length || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify ownership of all listings
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    if (listings.length !== ids.length) {
      return NextResponse.json(
        { error: 'Unauthorized to update some listings' },
        { status: 403 }
      );
    }

    // Perform bulk update
    const result = await prisma.listing.updateMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
      data: updates,
    });

    return NextResponse.json({
      message: 'Listings updated successfully',
      count: result.count,
    });
  } catch (error) {
    console.error('Listings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update listings' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings - Bulk delete listings
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids')?.split(',');

    if (!ids?.length) {
      return NextResponse.json(
        { error: 'No listing IDs provided' },
        { status: 400 }
      );
    }

    // Verify ownership of all listings
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    if (listings.length !== ids.length) {
      return NextResponse.json(
        { error: 'Unauthorized to delete some listings' },
        { status: 403 }
      );
    }

    // Delete listings and related records
    await prisma.$transaction([
      // Delete related records
      prisma.listingMedia.deleteMany({
        where: { listingId: { in: ids } },
      }),
      prisma.savedListing.deleteMany({
        where: { listingId: { in: ids } },
      }),
      prisma.review.deleteMany({
        where: { listingId: { in: ids } },
      }),
      prisma.booking.deleteMany({
        where: { listingId: { in: ids } },
      }),
      // Delete listings
      prisma.listing.deleteMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Listings deleted successfully',
      count: ids.length,
    });
  } catch (error) {
    console.error('Listings deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listings' },
      { status: 500 }
    );
  }
}