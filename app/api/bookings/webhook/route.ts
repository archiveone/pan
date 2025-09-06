import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
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
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Find the booking associated with this payment
      const booking = await prisma.booking.findFirst({
        where: {
          paymentIntentId: paymentIntent.id,
        },
        include: {
          user: true,
        },
      });

      if (!booking) {
        console.error('Booking not found for payment:', paymentIntent.id);
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Update booking status
      await prisma.booking.update({
        where: { id: booking.id },
        data: { 
          status: 'confirmed',
          paymentStatus: 'paid',
          confirmedAt: new Date(),
        },
      });

      // Get item details
      let item;
      switch (booking.itemType) {
        case 'property':
          item = await prisma.property.findUnique({
            where: { id: booking.itemId },
            include: { owner: true },
          });
          break;
        case 'service':
          item = await prisma.service.findUnique({
            where: { id: booking.itemId },
            include: { provider: true },
          });
          break;
        case 'leisure':
          item = await prisma.leisure.findUnique({
            where: { id: booking.itemId },
            include: { provider: true },
          });
          break;
      }

      if (!item) {
        console.error('Item not found for booking:', booking.id);
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      // Send confirmation notification to user
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          message: `Your booking for ${item.title} has been confirmed`,
          data: {
            bookingId: booking.id,
            itemId: booking.itemId,
            itemType: booking.itemType,
          },
        },
      });

      // Send notification to item owner/provider
      const recipientId = booking.itemType === 'property'
        ? item.owner.id
        : item.provider.id;

      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'BOOKING_CONFIRMED',
          title: 'New Confirmed Booking',
          message: `A booking for ${item.title} has been confirmed`,
          data: {
            bookingId: booking.id,
            itemId: booking.itemId,
            itemType: booking.itemType,
          },
        },
      });

      // Send confirmation emails (implement email service integration)
      // TODO: Implement email service
      
      return NextResponse.json({ received: true });
    }

    // Handle other event types if needed
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}