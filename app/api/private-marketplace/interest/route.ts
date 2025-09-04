import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the user is an agent
    const agent = await prismadb.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
        verificationStatus: true,
      },
    });

    if (agent?.role !== 'AGENT' || agent?.verificationStatus !== 'VERIFIED') {
      return new NextResponse("Only verified agents can express interest", { status: 403 });
    }

    const body = await req.json();
    const { 
      privateListingId,
      proposedCommission,
      message 
    } = body;

    if (!privateListingId || !proposedCommission) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if listing exists and is still pending
    const listing = await prismadb.privateListing.findUnique({
      where: {
        id: privateListingId,
        status: 'PENDING',
      },
      include: {
        property: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!listing) {
      return new NextResponse("Listing not found or not available", { status: 404 });
    }

    // Check if agent has already expressed interest
    const existingInterest = await prismadb.agentInterest.findFirst({
      where: {
        privateListingId,
        agentId: session.user.id,
      }
    });

    if (existingInterest) {
      return new NextResponse("Already expressed interest in this listing", { status: 400 });
    }

    // Create agent interest
    const agentInterest = await prismadb.agentInterest.create({
      data: {
        privateListingId,
        agentId: session.user.id,
        proposedCommission,
        message,
        status: 'PENDING',
      },
      include: {
        agent: {
          select: {
            name: true,
            email: true,
            agentBrokerage: true,
          }
        }
      }
    });

    // Notify property owner via Pusher
    await pusherServer.trigger(`private-user-${listing.userId}`, 'new-agent-interest', {
      message: `Agent ${agentInterest.agent.name} is interested in your property: ${listing.property.title}`,
      agentInterest: {
        id: agentInterest.id,
        agentName: agentInterest.agent.name,
        agentBrokerage: agentInterest.agent.agentBrokerage,
        proposedCommission: agentInterest.proposedCommission,
      }
    });

    return NextResponse.json(agentInterest);
  } catch (error) {
    console.error('[AGENT_INTEREST_CREATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return new NextResponse("Missing listingId", { status: 400 });
    }

    // Get all agent interests for a listing
    const interests = await prismadb.agentInterest.findMany({
      where: {
        privateListingId: listingId,
      },
      include: {
        agent: {
          select: {
            name: true,
            email: true,
            agentBrokerage: true,
            agentLicense: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(interests);
  } catch (error) {
    console.error('[AGENT_INTERESTS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}