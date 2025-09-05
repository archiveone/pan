import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Create booking record
        await prisma.booking.create({
          data: {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'confirmed',
            ticketType: paymentIntent.metadata.ticketType,
            quantity: parseInt(paymentIntent.metadata.quantity),
            userId: paymentIntent.metadata.userId,
            eventId: paymentIntent.metadata.eventId,
            paymentMethod: paymentIntent.payment_method_types[0],
            bookingReference: generateBookingReference(),
          },
        });

        // Send confirmation email
        await sendBookingConfirmationEmail({
          email: paymentIntent.receipt_email!,
          bookingDetails: {
            reference: generateBookingReference(),
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            ticketType: paymentIntent.metadata.ticketType,
            quantity: parseInt(paymentIntent.metadata.quantity),
          },
        });

        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        // Log failed payment
        await prisma.paymentLog.create({
          data: {
            paymentIntentId: failedPayment.id,
            status: 'failed',
            errorMessage: failedPayment.last_payment_error?.message,
            amount: failedPayment.amount,
            currency: failedPayment.currency,
          },
        });

        break;

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Refund;
        
        // Update booking status
        await prisma.booking.update({
          where: {
            paymentIntentId: refund.payment_intent as string,
          },
          data: {
            status: 'refunded',
            refundAmount: refund.amount,
            refundedAt: new Date(),
          },
        });

        // Send refund confirmation email
        await sendRefundConfirmationEmail({
          email: refund.receipt_email!,
          refundDetails: {
            amount: refund.amount / 100,
            currency: refund.currency.toUpperCase(),
            reason: refund.reason,
          },
        });

        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique booking reference
function generateBookingReference(): string {
  const prefix = 'BK';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Email sending functions (implement with your email service provider)
async function sendBookingConfirmationEmail(data: {
  email: string;
  bookingDetails: {
    reference: string;
    amount: number;
    currency: string;
    ticketType: string;
    quantity: number;
  };
}) {
  // Implement email sending logic
  // Example: Use SendGrid, AWS SES, or other email service
  console.log('Sending booking confirmation email:', data);
}

async function sendRefundConfirmationEmail(data: {
  email: string;
  refundDetails: {
    amount: number;
    currency: string;
    reason?: string;
  };
}) {
  // Implement email sending logic
  console.log('Sending refund confirmation email:', data);
}