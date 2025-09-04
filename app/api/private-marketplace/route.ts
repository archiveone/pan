import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/private-marketplace - Get private listings for verified agents
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a verified agent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true,
        isVerified: true,
        city: true,
        state: true,
        country: true
      },
    });

    if (user?.role !== 'AGENT' || !user.isVerified) {
      return NextResponse.json(
        { error: 'Only verified agents can access private marketplace' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get private listings in agent's area
    const where = {
      category: 'PROPERTY',
      status: 'PRIVATE',
      city: user.city,
      state: user.state,
      country: user.country,
    };

    const total = await prisma.listing.count({ where });

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
    console.error('Error fetching private listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch private listings' },
      { status: 500 }
    );
  }
}

// POST /api/private-marketplace - Submit a property to private marketplace
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
    if (!data.title || !data.description || !data.price || !data.city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create private listing
    const listing = await prisma.listing.create({
      data: {
        ...data,
        category: 'PROPERTY',
        status: 'PRIVATE',
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

    // Find verified agents in the area
    const areaAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isVerified: true,
        city: data.city,
        state: data.state,
        country: data.country,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // TODO: Send notifications to area agents about new private listing
    // This will be implemented with the notification system

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error creating private listing:', error);
    return NextResponse.json(
      { error: 'Failed to create private listing' },
      { status: 500 }
    );
  }
}

// POST /api/private-marketplace/[id]/inquire - Agent inquiry for private listing
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { listingId, message } = await request.json();

    // Check if user is a verified agent
    const agent = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true,
        isVerified: true,
      },
    });

    if (agent?.role !== 'AGENT' || !agent.isVerified) {
      return NextResponse.json(
        { error: 'Only verified agents can inquire about private listings' },
        { status: 403 }
      );
    }

    // Create inquiry
    const inquiry = await prisma.listingEnquiry.create({
      data: {
        message,
        user: {
          connect: { id: session.user.id },
        },
        listing: {
          connect: { id: listingId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            ownerId: true,
          },
        },
      },
    });

    // TODO: Send notification to listing owner about new inquiry
    // This will be implemented with the notification system

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}