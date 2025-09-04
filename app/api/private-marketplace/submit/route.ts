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
      title,
      description,
      price,
      location,
      postcode,
      type,
      images 
    } = body;

    if (!title || !price || !location || !postcode || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create property and private listing in a transaction
    const result = await prismadb.$transaction(async (tx) => {
      // Create the property
      const property = await tx.property.create({
        data: {
          title,
          description,
          price,
          location,
          postcode,
          type,
          images,
          status: 'PRIVATE',
          userId: session.user.id,
        },
      });

      // Create the private listing
      const privateListing = await tx.privateListing.create({
        data: {
          status: 'PENDING',
          propertyId: property.id,
          userId: session.user.id,
        },
      });

      // Find agents in the area
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

      return { property, privateListing, areaAgents };
    });

    // Notify matched agents via Pusher
    for (const agent of result.areaAgents) {
      await pusherServer.trigger(`private-user-${agent.id}`, 'new-private-listing', {
        message: `New private listing available in your area: ${result.property.title}`,
        propertyId: result.property.id,
        listingId: result.privateListing.id,
      });
    }

    return NextResponse.json(result.privateListing);
  } catch (error) {
    console.error('[PRIVATE_LISTING_CREATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}