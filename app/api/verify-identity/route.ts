import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createIdentityVerification, updateUserVerificationStatus } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a verification session
    const verificationSession = await createIdentityVerification(session.user.id);

    return NextResponse.json({
      url: verificationSession.url,
      sessionId: verificationSession.id,
    });
  } catch (error) {
    console.error('Error in POST /api/verify-identity:', error);
    return NextResponse.json(
      { error: 'Failed to create verification session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Update user verification status
    const updatedUser = await updateUserVerificationStatus(sessionId, session.user.id);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Verification not completed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: updatedUser.isVerified,
      verificationId: updatedUser.stripeVerificationId,
    });
  } catch (error) {
    console.error('Error in PUT /api/verify-identity:', error);
    return NextResponse.json(
      { error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's verification status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isVerified: true,
        stripeVerificationId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: user.isVerified,
      verificationId: user.stripeVerificationId,
    });
  } catch (error) {
    console.error('Error in GET /api/verify-identity:', error);
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}