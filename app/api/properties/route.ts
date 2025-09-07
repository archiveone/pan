import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/properties - Get all properties with filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const verified = searchParams.get('verified') === 'true';

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      ...(type && { type }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(bedrooms && { bedrooms: parseInt(bedrooms) }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(status && { status }),
      isVerified: verified,
    };

    // Get properties with pagination
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isVerified: true,
              companyName: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      type,
      price,
      size,
      bedrooms,
      bathrooms,
      features,
      location,
      images,
    } = body;

    // Validate required fields
    if (!title || !description || !type || !price || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        type,
        price: parseFloat(price),
        size: size ? parseFloat(size) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        features: features || [],
        location,
        status: 'DRAFT',
        isVerified: false,
        isFeatured: false,
        owner: {
          connect: { id: session.user.id },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isVerified: true,
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/properties - Update multiple properties
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { properties } = body;

    if (!Array.isArray(properties)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Update properties in transaction
    const updates = await prisma.$transaction(
      properties.map((property) => 
        prisma.property.update({
          where: {
            id: property.id,
            ownerId: session.user.id, // Ensure user owns the property
          },
          data: {
            title: property.title,
            description: property.description,
            price: property.price ? parseFloat(property.price) : undefined,
            status: property.status,
            features: property.features,
            isFeatured: property.isFeatured,
          },
        })
      )
    );

    return NextResponse.json({ updated: updates.length });
  } catch (error) {
    console.error('Update properties error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}