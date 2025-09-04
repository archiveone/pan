import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import {
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleIdentityVerified,
} from '@/lib/stripe';
import Stripe from 'stripe';

// Stripe webhook signing secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

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
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'identity.verification_session.completed':
        await handleIdentityVerified(
          event.data.object as Stripe.Identity.VerificationSession
        );
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Create transaction record
        await prisma.transaction.create({
          data: {
            stripePaymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency,
            status: 'succeeded',
            userId: paymentIntent.metadata.userId,
            type: paymentIntent.metadata.type || 'subscription',
          },
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        // Update transaction status
        await prisma.transaction.updateMany({
          where: {
            stripePaymentIntentId: failedPayment.id,
          },
          data: {
            status: 'failed',
            errorMessage: failedPayment.last_payment_error?.message,
          },
        });

        // Notify user of failed payment
        await prisma.notification.create({
          data: {
            userId: failedPayment.metadata.userId,
            type: 'PAYMENT_FAILED',
            title: 'Payment Failed',
            message: 'Your payment has failed. Please update your payment method.',
            isRead: false,
          },
        });
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        // Create invoice record
        await prisma.invoice.create({
          data: {
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: invoice.status,
            userId: invoice.metadata.userId,
            paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
            periodStart: new Date(invoice.period_start * 1000),
            periodEnd: new Date(invoice.period_end * 1000),
          },
        });
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        // Update invoice status
        await prisma.invoice.updateMany({
          where: {
            stripeInvoiceId: failedInvoice.id,
          },
          data: {
            status: 'failed',
          },
        });

        // Notify user of failed invoice payment
        await prisma.notification.create({
          data: {
            userId: failedInvoice.metadata.userId,
            type: 'INVOICE_FAILED',
            title: 'Invoice Payment Failed',
            message: 'Your invoice payment has failed. Please update your payment method.',
            isRead: false,
          },
        });
        break;

      case 'customer.updated':
        const customer = event.data.object as Stripe.Customer;
        // Update user's Stripe customer details
        await prisma.user.update({
          where: {
            stripeCustomerId: customer.id,
          },
          data: {
            stripeDefaultPaymentMethodId: customer.invoice_settings.default_payment_method as string,
            stripeUpdatedAt: new Date(),
          },
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}