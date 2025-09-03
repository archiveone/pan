import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyDetails, location, contactInfo } = await req.json();

    // Create property lead
    const lead = await prisma.propertyLead.create({
      data: {
        ownerId: session.user.id,
        propertyDetails,
        location,
        contactInfo,
        status: 'NEW',
        commissionRate: 5, // 5% commission rate
      },
    });

    // Find verified agents in the area
    const nearbyAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isVerified: true,
        serviceAreas: {
          contains: location.postcode
        }
      }
    });

    // Create notifications for nearby agents
    await prisma.notification.createMany({
      data: nearbyAgents.map(agent => ({
        userId: agent.id,
        type: 'NEW_LEAD',
        leadId: lead.id,
        message: `New property lead available in ${location.postcode}`,
      }))
    });

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      agentsNotified: nearbyAgents.length 
    });
  } catch (error) {
    console.error('Lead generation error:', error);
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    );
  }
}