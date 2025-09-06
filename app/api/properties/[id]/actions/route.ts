import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PropertyService } from '@/lib/services/propertyService';

const propertyService = new PropertyService();

export async function POST(
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

    const { action, ...data } = await req.json();

    switch (action) {
      case 'favorite':
        const isFavorited = await propertyService.toggleFavorite(
          params.id,
          session.user.id
        );
        return NextResponse.json({ isFavorited });

      case 'schedule-viewing':
        const { datetime, notes } = data;
        const viewing = await propertyService.scheduleViewing(
          params.id,
          session.user.id,
          new Date(datetime),
          notes
        );
        return NextResponse.json(viewing);

      case 'submit-offer':
        const { amount, message, validUntil } = data;
        const offer = await propertyService.submitOffer(
          params.id,
          session.user.id,
          amount,
          message,
          validUntil ? new Date(validUntil) : undefined
        );
        return NextResponse.json(offer);

      case 'request-valuation':
        if (!session.user.isAgent) {
          return NextResponse.json(
            { error: 'Only agents can request valuations' },
            { status: 403 }
          );
        }
        const { notes } = data;
        const valuation = await propertyService.requestValuation(
          params.id,
          session.user.id,
          notes
        );
        return NextResponse.json(valuation);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing property action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}