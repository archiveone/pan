import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/crm/leads - Get all leads for authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.LeadWhereInput = {
      ownerId: session.user.id,
      ...(status && { status }),
      ...(source && { source }),
    };

    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          property: true,
          service: true,
          leisure: true,
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads - Create a new lead
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
      source,
      value,
      contactName,
      contactEmail,
      contactPhone,
      propertyId,
      serviceId,
      leisureId,
      status,
      notes,
    } = body;

    const lead = await prisma.lead.create({
      data: {
        title,
        description,
        source,
        value: value ? parseFloat(value) : null,
        contactName,
        contactEmail,
        contactPhone,
        status: status || 'NEW',
        notes,
        ownerId: session.user.id,
        ...(propertyId && { property: { connect: { id: propertyId } } }),
        ...(serviceId && { service: { connect: { id: serviceId } } }),
        ...(leisureId && { leisure: { connect: { id: leisureId } } }),
      },
      include: {
        property: true,
        service: true,
        leisure: true,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/leads - Update multiple leads
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
    const { leads } = body;

    if (!Array.isArray(leads)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Update leads in transaction
    const updates = await prisma.$transaction(
      leads.map((lead) => 
        prisma.lead.update({
          where: {
            id: lead.id,
            ownerId: session.user.id, // Ensure user owns the lead
          },
          data: {
            status: lead.status,
            notes: lead.notes,
            lastContactedAt: lead.lastContactedAt,
            nextFollowUpDate: lead.nextFollowUpDate,
          },
        })
      )
    );

    return NextResponse.json({ updated: updates.length });
  } catch (error) {
    console.error('Update leads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}