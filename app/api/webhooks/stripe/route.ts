import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prismadb from '@/lib/prismadb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle VerificationSession events
    if (event.type === 'identity.verification_session.verified') {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      
      // Update user verification status
      await prismadb.user.update({
        where: {
          verificationSessionId: session.id,
        },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
        },
      });
    }

    // Handle verification failure
    if (event.type === 'identity.verification_session.requires_input') {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      
      await prismadb.user.update({
        where: {
          verificationSessionId: session.id,
        },
        data: {
          verificationStatus: 'FAILED',
          verificationError: session.last_error?.message,
        },
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}