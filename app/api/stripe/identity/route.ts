import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a VerificationSession
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: session.user.id,
      },
    });

    // Update user record with verification status
    await prismadb.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        verificationSessionId: verificationSession.id,
        verificationStatus: 'PENDING',
      },
    });

    return NextResponse.json({ 
      clientSecret: verificationSession.client_secret,
      url: verificationSession.url,
    });
  } catch (error) {
    console.error('[STRIPE_IDENTITY_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}