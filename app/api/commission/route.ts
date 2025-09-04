import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateCommission } from '@/lib/commission';

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
    const { propertyId, agentId, saleAmount } = body;

    if (!propertyId || !agentId || !saleAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the property exists and belongs to the correct owner
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Verify the agent exists and is verified
    const agent = await prisma.user.findFirst({
      where: {
        id: agentId,
        role: 'AGENT',
        isVerified: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or not verified' },
        { status: 404 }
      );
    }

    // Calculate commission amounts
    const { totalCommission, platformFee, agentCommission } = calculateCommission(saleAmount);

    // Create commission record
    const commission = await prisma.commission.create({
      data: {
        propertyId,
        agentId,
        saleAmount,
        totalCommission,
        platformFee,
        agentCommission,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create notification for agent
    await prisma.notification.create({
      data: {
        userId: agentId,
        type: 'COMMISSION',
        title: 'New Commission Created',
        message: `Commission of ${agentCommission} created for property ${property.address}`,
        isRead: false
      }
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Commission creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}