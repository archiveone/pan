"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookingType, BookingSlot, AvailabilityResponse } from '@/lib/types/booking';
import { bookingService } from '@/lib/services/booking';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingFormProps {
  itemId: string;
  itemType: BookingType;
  minGuests?: number;
  maxGuests?: number;
  allowedDates?: string[];
  basePrice: number;
  currency: string;
}

export default function BookingForm({
  itemId,
  itemType,
  minGuests = 1,
  maxGuests = 10,
  allowedDates,
  basePrice,
  currency,
}: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [guests, setGuests] = useState(minGuests);
  const [specialRequests, setSpecialRequests] = useState('');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check availability when date changes
  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    }
  }, [selectedDate]);

  const checkAvailability = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await bookingService.checkAvailability({
        itemId,
        itemType,
        startDate: selectedDate,
        endDate: selectedDate,
        guests,
      });

      setAvailability(response);
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('Please sign in to make a booking');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create booking
      const booking = await bookingService.createBooking({
        itemId,
        itemType,
        date: selectedDate,
        guests,
        specialRequests,
        userId: session.user.id,
      });

      if (booking.paymentRequired) {
        // Load Stripe
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Failed to load Stripe');

        // Redirect to Stripe checkout
        const { error } = await stripe.redirectToCheckout({
          clientSecret: booking.paymentUrl,
        });

        if (error) {
          throw error;
        }
      } else {
        // Handle non-payment bookings
        toast.success('Booking confirmed!');
        router.push('/bookings');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking');
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!availability) return basePrice;

    const total = availability.pricing.basePrice +
      (availability.pricing.additionalFees?.reduce(
        (sum, fee) => sum + fee.amount,
        0
      ) || 0);

    return total;
  };

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Date
          </label>
          <div className="mt-1 relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Number of Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Guests
          </label>
          <div className="mt-1 relative">
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {[...Array(maxGuests - minGuests + 1)].map((_, i) => (
                <option key={i + minGuests} value={i + minGuests}>
                  {i + minGuests} {i + minGuests === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
            <UsersIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Special Requests (Optional)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any special requirements or requests..."
          />
        </div>

        {/* Price Breakdown */}
        {availability && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-gray-900">Price Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price</span>
                <span>{availability.pricing.basePrice} {currency}</span>
              </div>
              {availability.pricing.additionalFees?.map((fee) => (
                <div key={fee.name} className="flex justify-between text-sm">
                  <span>{fee.name}</span>
                  <span>{fee.amount} {currency}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>{calculateTotal()} {currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !availability?.available}
          className="btn-primary w-full"
        >
          {loading ? 'Processing...' : 'Book Now'}
        </button>

        {/* Booking Policy */}
        <p className="text-center text-sm text-gray-500">
          Free cancellation up to 24 hours before the booking
        </p>
      </form>
    </div>
  );
}