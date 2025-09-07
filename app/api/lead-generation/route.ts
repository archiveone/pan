import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      source,
      contactName,
      contactEmail,
      contactPhone,
      propertyId,
      serviceId,
      leisureId,
      value
    } = body;

    // Validate required fields
    if (!contactName || !contactEmail || !(propertyId || serviceId || leisureId)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current session to check if user is logged in
    const session = await getServerSession(authOptions);
    
    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        title: title || 'New Lead',
        description: description || '',
        status: 'NEW',
        source: source || 'WEBSITE_FORM',
        value: value ? parseFloat(value) : null,
        contactName,
        contactEmail,
        contactPhone,
        // If user is logged in, assign them as owner
        ownerId: session?.user?.id || null,
        // Connect to relevant listing
        ...(propertyId && { property: { connect: { id: propertyId } } }),
        ...(serviceId && { service: { connect: { id: serviceId } } }),
        ...(leisureId && { leisure: { connect: { id: leisureId } } }),
      },
    });

    // If the lead is connected to a property/service/leisure, notify the owner
    let listingOwner;
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { owner: true },
      });
      listingOwner = property?.owner;
    } else if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { provider: true },
      });
      listingOwner = service?.provider;
    } else if (leisureId) {
      const leisure = await prisma.leisure.findUnique({
        where: { id: leisureId },
        include: { owner: true },
      });
      listingOwner = leisure?.owner;
    }

    // Create a task for the listing owner
    if (listingOwner) {
      await prisma.task.create({
        data: {
          title: `Follow up with ${contactName}`,
          description: `New lead received from ${contactName} (${contactEmail})`,
          priority: 'HIGH',
          status: 'TODO',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
          assignedToId: listingOwner.id,
          creatorId: listingOwner.id,
          leadId: lead.id,
        },
      });

      // TODO: Send email notification to listing owner
      // TODO: Send Pusher notification to listing owner
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Lead generation error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}