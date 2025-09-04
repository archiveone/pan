import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function PATCH(
  req: Request,
  { params }: { params: { interestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { decision } = body;

    if (!decision || !['ACCEPTED', 'REJECTED'].includes(decision)) {
      return new NextResponse("Invalid decision", { status: 400 });
    }

    // Get the agent interest and verify ownership
    const agentInterest = await prismadb.agentInterest.findUnique({
      where: {
        id: params.interestId,
      },
      include: {
        privateListing: {
          include: {
            property: true,
            user: true,
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!agentInterest) {
      return new NextResponse("Interest not found", { status: 404 });
    }

    if (agentInterest.privateListing.userId !== session.user.id) {
      return new NextResponse("Not authorized to make this decision", { status: 403 });
    }

    if (agentInterest.status !== 'PENDING') {
      return new NextResponse("Interest has already been processed", { status: 400 });
    }

    // Process the decision in a transaction
    const result = await prismadb.$transaction(async (tx) => {
      // Update agent interest status
      const updatedInterest = await tx.agentInterest.update({
        where: { id: params.interestId },
        data: { status: decision },
      });

      if (decision === 'ACCEPTED') {
        // Update private listing status and assign agent
        await tx.privateListing.update({
          where: { id: agentInterest.privateListingId },
          data: {
            status: 'ASSIGNED',
            assignedAgentId: agentInterest.agentId,
            commission: agentInterest.proposedCommission,
          },
        });

        // Reject all other pending interests
        await tx.agentInterest.updateMany({
          where: {
            privateListingId: agentInterest.privateListingId,
            id: { not: params.interestId },
            status: 'PENDING',
          },
          data: {
            status: 'REJECTED',
          },
        });

        // Create a conversation between owner and agent
        const conversation = await tx.conversation.create({
          data: {
            name: `Property Discussion: ${agentInterest.privateListing.property.title}`,
            users: {
              connect: [
                { id: session.user.id },
                { id: agentInterest.agentId },
              ],
            },
            messages: {
              create: {
                content: `Congratulations! Your offer to represent this property has been accepted. Let's discuss the next steps.`,
                userId: session.user.id,
              },
            },
          },
        });

        return { ...updatedInterest, conversationId: conversation.id };
      }

      return updatedInterest;
    });

    // Send notifications
    await pusherServer.trigger(
      `private-user-${agentInterest.agentId}`,
      'interest-decision',
      {
        interestId: params.interestId,
        decision,
        propertyTitle: agentInterest.privateListing.property.title,
        message: decision === 'ACCEPTED'
          ? 'Your interest has been accepted! Check your messages to discuss next steps.'
          : 'Your interest was not accepted for this property.',
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[AGENT_INTEREST_DECISION]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { interestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agentInterest = await prismadb.agentInterest.findUnique({
      where: {
        id: params.interestId,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            agentBrokerage: true,
            agentLicense: true,
          }
        },
        privateListing: {
          include: {
            property: true,
          }
        }
      }
    });

    if (!agentInterest) {
      return new NextResponse("Interest not found", { status: 404 });
    }

    // Verify user has permission to view this interest
    if (agentInterest.agentId !== session.user.id && 
        agentInterest.privateListing.userId !== session.user.id) {
      return new NextResponse("Not authorized to view this interest", { status: 403 });
    }

    return NextResponse.json(agentInterest);
  } catch (error) {
    console.error('[AGENT_INTEREST_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}