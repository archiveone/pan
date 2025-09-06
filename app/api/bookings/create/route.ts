import { NextResponse } from 'next/server';
import { BookingRequest, BookingResponse } from '@/lib/types/booking';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: BookingRequest = await request.json();
    const { itemId, itemType, date, startTime, endTime, guests, specialRequests } = body;

    // Validate request
    if (!itemId || !itemType || !date || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get item details based on type
    let item;
    switch (itemType) {
      case 'property':
        item = await prisma.property.findUnique({
          where: { id: itemId },
          include: { owner: true },
        });
        break;
      case 'service':
        item = await prisma.service.findUnique({
          where: { id: itemId },
          include: { provider: true },
        });
        break;
      case 'leisure':
        item = await prisma.leisure.findUnique({
          where: { id: itemId },
          include: { provider: true },
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid item type' },
          { status: 400 }
        );
    }

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check availability
    const bookingDate = new Date(date);
    const existingBookings = await prisma.booking.findMany({
      where: {
        itemId,
        itemType,
        date: bookingDate,
        status: {
          not: 'cancelled',
        },
      },
    });

    const currentBookings = existingBookings.reduce(
      (sum, booking) => sum + (booking.guests || 0),
      0
    );

    if (currentBookings + guests > item.maxGuests) {
      return NextResponse.json(
        { error: 'Not enough capacity for requested guests' },
        { status: 400 }
      );
    }

    // Calculate total price
    let totalPrice = item.price;
    
    // Add cleaning fee for properties
    if (itemType === 'property' && item.cleaningFee) {
      totalPrice += item.cleaningFee;
    }

    // Add service fee (10%)
    const serviceFee = Math.round(item.price * 0.1);
    totalPrice += serviceFee;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert to cents
      currency: item.currency.toLowerCase(),
      metadata: {
        itemId,
        itemType,
        date,
        guests: guests.toString(),
      },
    });

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        itemId,
        itemType,
        userId: session.user.id,
        date: bookingDate,
        startTime,
        endTime,
        guests,
        specialRequests,
        status: 'pending',
        totalAmount: totalPrice,
        currency: item.currency,
        paymentIntentId: paymentIntent.id,
      },
    });

    // Send notification to item owner/provider
    const recipientId = itemType === 'property' 
      ? item.owner.id 
      : item.provider.id;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_BOOKING',
        title: 'New Booking Request',
        message: `New booking request for ${item.title} on ${date}`,
        data: {
          bookingId: booking.id,
          itemId,
          itemType,
        },
      },
    });

    const response: BookingResponse = {
      id: booking.id,
      status: 'pending',
      paymentRequired: true,
      paymentAmount: totalPrice,
      paymentCurrency: item.currency,
      paymentUrl: paymentIntent.client_secret!,
      bookingReference: booking.id,
      confirmationEmail: session.user.email!,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}