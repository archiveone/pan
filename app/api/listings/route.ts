import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/listings - Get all listings with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const where: any = {
      status: 'ACTIVE',
    };

    if (category) where.category = category;
    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Get total count for pagination
    const total = await prisma.listing.count({ where });

    // Get listings with pagination
    const listings = await prisma.listing.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            savedBy: true,
            enquiries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
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
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Basic validation
    if (!data.title || !data.description || !data.price || !data.category || !data.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        ...data,
        owner: {
          connect: { id: session.user.id },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// PATCH /api/listings - Bulk update listings (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { ids, data } = await request.json();

    // Update multiple listings
    const result = await prisma.listing.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating listings:', error);
    return NextResponse.json(
      { error: 'Failed to update listings' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings - Bulk delete listings (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { ids } = await request.json();

    // Delete multiple listings
    const result = await prisma.listing.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting listings:', error);
    return NextResponse.json(
      { error: 'Failed to delete listings' },
      { status: 500 }
    );
  }
}