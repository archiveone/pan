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

    const body = await req.json();
    const { 
      address,
      postcode,
      propertyType,
      bedrooms,
      bathrooms,
      description,
      images 
    } = body;

    if (!address || !postcode || !propertyType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create valuation request and notify agents
    const result = await prismadb.$transaction(async (tx) => {
      // Create the valuation request
      const valuationRequest = await tx.valuationRequest.create({
        data: {
          address,
          postcode,
          propertyType,
          bedrooms,
          bathrooms,
          description,
          images,
          status: 'PENDING',
          userId: session.user.id,
        },
      });

      // Find verified agents in the area
      const areaAgents = await tx.user.findMany({
        where: {
          role: 'AGENT',
          verificationStatus: 'VERIFIED',
          serviceAreas: {
            has: postcode.substring(0, 4) // Match first part of postcode
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
        }
      });

      return { valuationRequest, areaAgents };
    });

    // Notify matched agents via Pusher
    for (const agent of result.areaAgents) {
      await pusherServer.trigger(`private-user-${agent.id}`, 'new-valuation-request', {
        message: `New valuation request in your area: ${result.valuationRequest.address}`,
        requestId: result.valuationRequest.id,
      });
    }

    return NextResponse.json(result.valuationRequest);
  } catch (error) {
    console.error('[VALUATION_REQUEST_CREATE]', error);
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
    const status = searchParams.get('status');

    // Get user's valuation requests
    const valuationRequests = await prismadb.valuationRequest.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status }),
      },
      include: {
        offers: {
          include: {
            agent: {
              select: {
                name: true,
                email: true,
                agentBrokerage: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(valuationRequests);
  } catch (error) {
    console.error('[VALUATION_REQUESTS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}