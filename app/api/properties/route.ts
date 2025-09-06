import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handlePropertySubmission } from '@/lib/subscription';
import { checkPermission } from '@/lib/auth/permissions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to create properties
    if (!checkPermission('CREATE_PROPERTY')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Handle property submission with role-based logic
    const property = await handlePropertySubmission(session.user.id, data);

    return NextResponse.json(property);
  } catch (error: any) {
    if (error.message === 'Monthly listing quota exceeded') {
      return NextResponse.json(
        {
          error: 'Monthly listing quota exceeded',
          message: 'Upgrade to PRO for unlimited listings',
        },
        { status: 403 }
      );
    }

    console.error('Error in POST /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get('marketplace');
    const status = searchParams.get('status');

    // Build query based on user role and marketplace
    const query: any = {
      where: {},
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            companyName: true,
            isVerified: true,
          },
        },
      },
    };

    // Filter by marketplace type
    if (marketplace === 'agent') {
      query.where.inAgentMarketplace = true;
    } else if (marketplace === 'public') {
      query.where.inPublicMarketplace = true;
    }

    // Filter by status if provided
    if (status) {
      query.where.status = status;
    }

    // Role-based access control
    const userRole = session.user.role;
    switch (userRole) {
      case 'ADMIN':
        // Admins can see all properties
        break;
      case 'AGENT':
        if (!session.user.isVerified) {
          // Unverified agents can only see their own listings
          query.where.ownerId = session.user.id;
        }
        // Verified agents can see public marketplace and agent marketplace
        break;
      case 'LANDLORD':
        // Landlords can only see their own listings and the agent marketplace
        query.where.OR = [
          { ownerId: session.user.id },
          { inAgentMarketplace: true },
        ];
        break;
      default:
        // Regular users can only see public marketplace
        query.where.inPublicMarketplace = true;
        query.where.status = 'ACTIVE';
    }

    const properties = await prisma.property.findMany(query);

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error in GET /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    // Check if user has permission to update this property
    const property = await prisma.property.findUnique({
      where: { id },
      select: { ownerId: true, status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Only owner, agents (for agent marketplace), and admins can update
    const canUpdate =
      property.ownerId === session.user.id ||
      session.user.role === 'ADMIN' ||
      (session.user.role === 'AGENT' &&
        property.status === 'PENDING_REVIEW' &&
        session.user.isVerified);

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Handle status changes based on role
    if (updateData.status) {
      switch (session.user.role) {
        case 'ADMIN':
          // Admins can set any status
          break;
        case 'AGENT':
          // Verified agents can only approve/reject properties in agent marketplace
          if (!session.user.isVerified) {
            delete updateData.status;
          } else if (property.status !== 'PENDING_REVIEW') {
            return NextResponse.json(
              { error: 'Can only update pending properties' },
              { status: 403 }
            );
          }
          break;
        default:
          // Others cannot change status
          delete updateData.status;
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...updateData,
        // Track who reviewed the property
        ...(updateData.status && {
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        }),
      },
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error in PUT /api/properties:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}