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
      return new NextResponse("Only verified agents can submit valuations", { status: 403 });
    }

    const body = await req.json();
    const { 
      requestId,
      value,
      confidence,
      notes 
    } = body;

    if (!requestId || !value || !confidence) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate confidence level
    if (confidence < 1 || confidence > 5) {
      return new NextResponse("Confidence must be between 1 and 5", { status: 400 });
    }

    // Check if valuation request exists and is still pending
    const request = await prismadb.valuationRequest.findUnique({
      where: {
        id: requestId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!request) {
      return new NextResponse("Valuation request not found or not available", { status: 404 });
    }

    // Check if agent has already submitted an offer
    const existingOffer = await prismadb.valuationOffer.findFirst({
      where: {
        requestId,
        agentId: session.user.id,
      }
    });

    if (existingOffer) {
      return new NextResponse("Already submitted a valuation for this request", { status: 400 });
    }

    // Create valuation offer
    const valuationOffer = await prismadb.valuationOffer.create({
      data: {
        requestId,
        agentId: session.user.id,
        value,
        confidence,
        notes,
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

    // Update request status if this is the first offer
    const offersCount = await prismadb.valuationOffer.count({
      where: { requestId }
    });

    if (offersCount === 1) {
      await prismadb.valuationRequest.update({
        where: { id: requestId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    // Notify property owner via Pusher
    await pusherServer.trigger(`private-user-${request.userId}`, 'new-valuation-offer', {
      message: `New valuation received from ${valuationOffer.agent.name}`,
      requestId,
      offerId: valuationOffer.id,
      agentName: valuationOffer.agent.name,
      agentBrokerage: valuationOffer.agent.agentBrokerage,
      value: valuationOffer.value,
    });

    return NextResponse.json(valuationOffer);
  } catch (error) {
    console.error('[VALUATION_OFFER_CREATE]', error);
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
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return new NextResponse("Missing requestId", { status: 400 });
    }

    // Get valuation request and verify access
    const request = await prismadb.valuationRequest.findUnique({
      where: { id: requestId },
      select: { userId: true }
    });

    if (!request) {
      return new NextResponse("Valuation request not found", { status: 404 });
    }

    // Only allow the property owner or agents who have submitted offers to view
    const offers = await prismadb.valuationOffer.findMany({
      where: {
        requestId,
        OR: [
          { agentId: session.user.id },
          { request: { userId: session.user.id } }
        ]
      },
      include: {
        agent: {
          select: {
            name: true,
            email: true,
            agentBrokerage: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (offers.length === 0 && request.userId !== session.user.id) {
      return new NextResponse("Not authorized to view these offers", { status: 403 });
    }

    return NextResponse.json(offers);
  } catch (error) {
    console.error('[VALUATION_OFFERS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}