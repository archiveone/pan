import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PropertyService } from '@/lib/services/propertyService';
import { PropertyUpdateInput } from '@/lib/types/property';

const propertyService = new PropertyService();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await propertyService.getProperty(params.id);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    if (property.isPrivate && (!session?.user || (
      property.ownerId !== session.user.id &&
      property.agentId !== session.user.id
    ))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error getting property:', error);
    return NextResponse.json(
      { error: 'Failed to get property' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const property = await propertyService.getProperty(params.id);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update
    if (
      property.ownerId !== session.user.id &&
      property.agentId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data: PropertyUpdateInput = await req.json();
    const updatedProperty = await propertyService.updateProperty(params.id, data);
    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

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

    const property = await propertyService.getProperty(params.id);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete
    if (property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await propertyService.deleteProperty(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}