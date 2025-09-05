import Stripe from "stripe";
import { prisma } from "./prisma";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function createVerificationSession(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name!,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Create verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        userId: user.id,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/verification/complete`,
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: "PENDING" },
    });

    return verificationSession;
  } catch (error) {
    console.error("Error creating verification session:", error);
    throw error;
  }
}

export async function handleVerificationWebhook(event: Stripe.Event) {
  try {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = session.metadata?.userId;

    if (!userId) {
      throw new Error("No userId in session metadata");
    }

    switch (event.type) {
      case "identity.verification_session.verified":
        await prisma.user.update({
          where: { id: userId },
          data: { 
            verificationStatus: "VERIFIED",
            identityDocument: session.id
          },
        });
        break;

      case "identity.verification_session.requires_input":
        // Handle cases where additional information is needed
        break;

      case "identity.verification_session.canceled":
        await prisma.user.update({
          where: { id: userId },
          data: { verificationStatus: "UNVERIFIED" },
        });
        break;
    }
  } catch (error) {
    console.error("Error handling verification webhook:", error);
    throw error;
  }
}

export async function getVerificationStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        verificationStatus: true,
        identityDocument: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.identityDocument) {
      const session = await stripe.identity.verificationSessions.retrieve(
        user.identityDocument
      );
      return {
        status: user.verificationStatus,
        details: session,
      };
    }

    return {
      status: user.verificationStatus,
      details: null,
    };
  } catch (error) {
    console.error("Error getting verification status:", error);
    throw error;
  }
}