import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/properties - Get all properties with filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || undefined;
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 999999999;

    const properties = await prisma.property.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          },
          {
            type: type as any || undefined,
          },
          {
            price: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Property fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
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
    const { title, description, address, price, type, images } = body;

    // Validate required fields
    if (!title || !address || !price || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        price: Number(price),
        type,
        ownerId: session.user.id,
        status: 'ACTIVE',
      },
    });

    // Create notification for nearby agents
    await prisma.notification.create({
      data: {
        type: 'PROPERTY',
        title: 'New Property Listed',
        message: `New ${type.toLowerCase()} property listed at ${address}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

// PATCH /api/properties - Update a property
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
    const { id, ...updateData } = body;

    // Verify ownership
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingProperty || existingProperty.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this property' },
        { status: 403 }
      );
    }

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Property update error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}