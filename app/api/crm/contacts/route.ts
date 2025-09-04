import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/crm/contacts - Get all contacts for the current user
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
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const contacts = await prisma.contact.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type: type as any }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            completed: true,
          },
        },
        notes: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        lastContact: 'desc',
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Contact fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/crm/contacts - Create a new contact
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
    const { name, email, phone, type, company, address, notes } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        type,
        company,
        address,
        userId: session.user.id,
        lastContact: new Date(),
      },
    });

    // Add initial note if provided
    if (notes) {
      await prisma.contactNote.create({
        data: {
          contactId: contact.id,
          content: notes,
          userId: session.user.id,
        },
      });
    }

    // Create follow-up task
    await prisma.task.create({
      data: {
        userId: session.user.id,
        contactId: contact.id,
        title: `Initial follow-up with ${name}`,
        description: `Schedule initial meeting or call with new contact`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        priority: 'MEDIUM',
        completed: false,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Contact creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/contacts - Update a contact
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
    const existingContact = await prisma.contact.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingContact || existingContact.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this contact' },
        { status: 403 }
      );
    }

    // Update contact
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...updateData,
        lastContact: new Date(), // Update last contact timestamp
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Contact update error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/contacts/[id] - Archive a contact
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
    const existingContact = await prisma.contact.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!existingContact || existingContact.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to archive this contact' },
        { status: 403 }
      );
    }

    // Archive contact (soft delete)
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        archived: true,
        archivedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Contact archived successfully',
      id: params.id,
    });
  } catch (error) {
    console.error('Contact archive error:', error);
    return NextResponse.json(
      { error: 'Failed to archive contact' },
      { status: 500 }
    );
  }
}