import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/crm/leads - Get all leads for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const leads = await prisma.lead.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            completed: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Lead fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads - Create a new lead
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
    const { name, email, phone, source, propertyId, notes } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source,
        propertyId,
        notes,
        status: 'NEW',
        userId: session.user.id,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'LEAD',
        title: 'New Lead Created',
        message: `New lead ${name} has been created`,
        isRead: false,
      },
    });

    // If property is specified, create a task for follow-up
    if (propertyId) {
      await prisma.task.create({
        data: {
          userId: session.user.id,
          leadId: lead.id,
          title: `Follow up with ${name} about property`,
          description: `Initial contact regarding property inquiry`,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          priority: 'HIGH',
          completed: false,
        },
      });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/leads - Update a lead
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
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingLead || existingLead.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this lead' },
        { status: 403 }
      );
    }

    // Update lead
    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    // If status is updated to QUALIFIED, create a task for next steps
    if (updateData.status === 'QUALIFIED') {
      await prisma.task.create({
        data: {
          userId: session.user.id,
          leadId: lead.id,
          title: 'Schedule property viewing',
          description: 'Lead has been qualified - arrange property viewing',
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
          priority: 'HIGH',
          completed: false,
        },
      });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}