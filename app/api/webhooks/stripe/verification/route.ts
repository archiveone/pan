import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

async function handleVerificationSessionCompleted(session: Stripe.Identity.VerificationSession) {
  const userId = session.metadata.userId;
  if (!userId) return;

  if (session.status === 'verified') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_VERIFICATION_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'identity.verification_session.completed':
        await handleVerificationSessionCompleted(
          event.data.object as Stripe.Identity.VerificationSession
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}