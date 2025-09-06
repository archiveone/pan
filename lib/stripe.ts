import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const createIdentityVerification = async (userId: string) => {
  try {
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId,
      },
      options: {
        document: {
          require_id_number: true,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });

    return verificationSession;
  } catch (error) {
    console.error('Error creating identity verification session:', error);
    throw error;
  }
};

export const retrieveIdentityVerification = async (sessionId: string) => {
  try {
    const verificationSession = await stripe.identity.verificationSessions.retrieve(
      sessionId
    );

    return verificationSession;
  } catch (error) {
    console.error('Error retrieving identity verification session:', error);
    throw error;
  }
};

export const updateUserVerificationStatus = async (
  sessionId: string,
  userId: string
) => {
  try {
    const session = await retrieveIdentityVerification(sessionId);
    
    if (session.status === 'verified') {
      // Update user verification status in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          stripeVerificationId: sessionId,
        },
      });

      return updatedUser;
    }

    return null;
  } catch (error) {
    console.error('Error updating user verification status:', error);
    throw error;
  }
};