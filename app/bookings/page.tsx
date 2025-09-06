"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { bookingService } from '@/lib/services/booking';
import { BookingResponse } from '@/lib/types/booking';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      loadBookings();
    }
  }, [session]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const userBookings = await bookingService.getUserBookings(session!.user.id);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      loadBookings(); // Reload bookings
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900">
              Please sign in to view your bookings
            </h2>
            <p className="mt-4 text-gray-600">
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>{' '}
              to access your booking history and manage your reservations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-gray-600">
              View and manage your bookings across properties, services, and experiences
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-4 text-red-600">{error}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-2 text-gray-600">
                Start exploring our properties, services, and experiences
              </p>
              <div className="mt-6 space-x-4">
                <Link href="/properties" className="btn-primary">
                  Browse Properties
                </Link>
                <Link href="/services" className="btn-secondary">
                  Find Services
                </Link>
                <Link href="/leisure" className="btn-secondary">
                  Discover Experiences
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="card p-6">
                  <div className="flex items-start space-x-6">
                    <div className="relative h-24 w-32 flex-shrink-0">
                      <Image
                        src={booking.item.image}
                        alt={booking.item.title}
                        className="rounded-lg object-cover"
                        fill
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {booking.item.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-1.5 h-4 w-4" />
                          {format(new Date(booking.date), 'PPP')}
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="mr-1.5 h-4 w-4" />
                          {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="mr-1.5 h-4 w-4" />
                          {booking.item.location}
                        </div>
                        <div className="flex items-center">
                          <CurrencyEuroIcon className="mr-1.5 h-4 w-4" />
                          {booking.paymentAmount} {booking.paymentCurrency}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-4">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="btn-secondary text-sm"
                        >
                          View Details
                        </Link>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-sm text-red-600 hover:text-red-500"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}