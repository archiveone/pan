import { NextResponse } from 'next/server';
import { AvailabilityRequest, AvailabilityResponse } from '@/lib/types/booking';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body: AvailabilityRequest = await request.json();
    const { itemId, itemType, startDate, endDate, guests } = body;

    // Validate request
    if (!itemId || !itemType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all existing bookings for the item in the date range
    const existingBookings = await prisma.booking.findMany({
      where: {
        itemId,
        itemType,
        date: {
          gte: start,
          lte: end,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    // Get item details based on type
    let item;
    switch (itemType) {
      case 'property':
        item = await prisma.property.findUnique({
          where: { id: itemId },
        });
        break;
      case 'service':
        item = await prisma.service.findUnique({
          where: { id: itemId },
        });
        break;
      case 'leisure':
        item = await prisma.leisure.findUnique({
          where: { id: itemId },
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

    // Generate availability slots
    const slots = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBookings = existingBookings.filter(
        (booking) => booking.date.toISOString().split('T')[0] === dateStr
      );

      // Check if the date is available based on existing bookings and capacity
      const currentBookings = dayBookings.reduce(
        (sum, booking) => sum + (booking.guests || 0),
        0
      );

      slots.push({
        id: dateStr,
        date: dateStr,
        available: currentBookings < item.maxGuests,
        maxGuests: item.maxGuests,
        currentBookings,
        price: item.price,
        currency: item.currency,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate pricing
    const basePrice = item.price;
    const additionalFees = [];

    // Add cleaning fee for properties
    if (itemType === 'property' && item.cleaningFee) {
      additionalFees.push({
        name: 'Cleaning Fee',
        amount: item.cleaningFee,
      });
    }

    // Add service fee
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    additionalFees.push({
      name: 'Service Fee',
      amount: serviceFee,
    });

    const response: AvailabilityResponse = {
      available: slots.some((slot) => slot.available),
      slots,
      pricing: {
        basePrice,
        currency: item.currency,
        additionalFees,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}