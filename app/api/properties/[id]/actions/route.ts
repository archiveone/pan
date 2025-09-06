import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Action schemas
const favoriteSchema = z.object({
  action: z.literal('favorite'),
});

const viewingSchema = z.object({
  action: z.literal('schedule-viewing'),
  datetime: z.string().datetime(),
  notes: z.string().optional(),
});

const offerSchema = z.object({
  action: z.literal('submit-offer'),
  amount: z.number().positive(),
  message: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

const valuationSchema = z.object({
  action: z.literal('request-valuation'),
  notes: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'favorite':
        return handleFavorite(params.id, session.user.id);
      case 'schedule-viewing':
        return handleViewing(params.id, session.user.id, body);
      case 'submit-offer':
        return handleOffer(params.id, session.user.id, body);
      case 'request-valuation':
        return handleValuation(params.id, session.user.id, body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/properties/[id]/actions:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

async function handleFavorite(propertyId: string, userId: string) {
  // Check if already favorited
  const existing = await prisma.propertyFavorite.findUnique({
    where: {
      propertyId_userId: {
        propertyId,
        userId,
      },
    },
  });

  if (existing) {
    // Remove favorite
    await prisma.propertyFavorite.delete({
      where: {
        propertyId_userId: {
          propertyId,
          userId,
        },
      },
    });

    return NextResponse.json({
      message: 'Property removed from favorites',
      isFavorited: false,
    });
  } else {
    // Add favorite
    await prisma.propertyFavorite.create({
      data: {
        propertyId,
        userId,
      },
    });

    return NextResponse.json({
      message: 'Property added to favorites',
      isFavorited: true,
    });
  }
}

async function handleViewing(
  propertyId: string,
  userId: string,
  data: any
) {
  const validated = viewingSchema.parse(data);

  // Check for existing viewing at the same time
  const existing = await prisma.propertyViewing.findFirst({
    where: {
      propertyId,
      datetime: new Date(validated.datetime),
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'This time slot is already booked' },
      { status: 400 }
    );
  }

  // Create viewing
  const viewing = await prisma.propertyViewing.create({
    data: {
      propertyId,
      userId,
      datetime: new Date(validated.datetime),
      notes: validated.notes,
      status: 'PENDING',
    },
  });

  // TODO: Send notifications to property owner/agent

  return NextResponse.json({
    message: 'Viewing scheduled successfully',
    viewing,
  });
}

async function handleOffer(
  propertyId: string,
  userId: string,
  data: any
) {
  const validated = offerSchema.parse(data);

  // Create offer
  const offer = await prisma.propertyOffer.create({
    data: {
      propertyId,
      userId,
      amount: validated.amount,
      message: validated.message,
      validUntil: validated.validUntil ? new Date(validated.validUntil) : null,
      status: 'PENDING',
    },
  });

  // TODO: Send notifications to property owner/agent

  return NextResponse.json({
    message: 'Offer submitted successfully',
    offer,
  });
}

async function handleValuation(
  propertyId: string,
  userId: string,
  data: any
) {
  const validated = valuationSchema.parse(data);

  // Create valuation request
  const valuation = await prisma.propertyValuation.create({
    data: {
      propertyId,
      userId,
      notes: validated.notes,
      status: 'PENDING',
    },
  });

  // TODO: Send notifications to property owner/agent

  return NextResponse.json({
    message: 'Valuation request submitted successfully',
    valuation,
  });
}

// Get property action status
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      favorite,
      viewings,
      offers,
      valuations,
    ] = await Promise.all([
      prisma.propertyFavorite.findUnique({
        where: {
          propertyId_userId: {
            propertyId: params.id,
            userId: session.user.id,
          },
        },
      }),
      prisma.propertyViewing.findMany({
        where: {
          propertyId: params.id,
          userId: session.user.id,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.propertyOffer.findMany({
        where: {
          propertyId: params.id,
          userId: session.user.id,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.propertyValuation.findMany({
        where: {
          propertyId: params.id,
          userId: session.user.id,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      isFavorited: !!favorite,
      viewings,
      offers,
      valuations,
    });
  } catch (error) {
    console.error('Error in GET /api/properties/[id]/actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action status' },
      { status: 500 }
    );
  }
}