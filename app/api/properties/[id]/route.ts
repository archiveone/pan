import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/properties/[id] - Get a single property
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
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
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Property fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id] - Update a property
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Verify ownership
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
      data: body,
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

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    if (!existingProperty || existingProperty.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this property' },
        { status: 403 }
      );
    }

    // Delete property
    await prisma.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Property deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}