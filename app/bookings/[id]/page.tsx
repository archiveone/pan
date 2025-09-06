"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface BookingDetailPageProps {
  params: {
    id: string;
  };
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      loadBookingDetails();
    }
  }, [session, params.id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const bookingDetails = await bookingService.getBookingDetails(params.id);
      setBooking(bookingDetails);
    } catch (error) {
      console.error('Error loading booking details:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      await bookingService.cancelBooking(booking.id);
      toast.success('Booking cancelled successfully');
      loadBookingDetails(); // Reload booking details
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
              Please sign in to view booking details
            </h2>
            <p className="mt-4 text-gray-600">
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>{' '}
              to access your booking information.
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
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Bookings
          </button>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading booking details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-4 text-red-600">{error}</p>
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* Booking Header */}
              <div className="card p-6">
                <div className="flex items-start space-x-6">
                  <div className="relative h-32 w-48 flex-shrink-0">
                    <Image
                      src={booking.item.image}
                      alt={booking.item.title}
                      className="rounded-lg object-cover"
                      fill
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-semibold text-gray-900">
                        {booking.item.title}
                      </h1>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        <span className="ml-1.5 capitalize">{booking.status}</span>
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{booking.item.description}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="card p-6 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Booking Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="mr-1.5 h-5 w-5" />
                        <span className="text-sm font-medium">Date</span>
                      </div>
                      <p className="mt-1 text-gray-900">
                        {format(new Date(booking.date), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-500">
                        <UsersIcon className="mr-1.5 h-5 w-5" />
                        <span className="text-sm font-medium">Guests</span>
                      </div>
                      <p className="mt-1 text-gray-900">
                        {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="mr-1.5 h-5 w-5" />
                        <span className="text-sm font-medium">Location</span>
                      </div>
                      <p className="mt-1 text-gray-900">{booking.item.location}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-500">
                        <CurrencyEuroIcon className="mr-1.5 h-5 w-5" />
                        <span className="text-sm font-medium">Total Price</span>
                      </div>
                      <p className="mt-1 text-gray-900">
                        {booking.paymentAmount} {booking.paymentCurrency}
                      </p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div>
                      <div className="flex items-center text-gray-500">
                        <ChatBubbleLeftIcon className="mr-1.5 h-5 w-5" />
                        <span className="text-sm font-medium">Special Requests</span>
                      </div>
                      <p className="mt-1 text-gray-900">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Actions and Information */}
                <div className="space-y-6">
                  <div className="card p-6">
                    <h2 className="text-lg font-medium text-gray-900">Actions</h2>
                    <div className="mt-4 space-y-4">
                      {booking.status === 'pending' && (
                        <button
                          onClick={handleCancelBooking}
                          className="btn-danger w-full"
                        >
                          Cancel Booking
                        </button>
                      )}
                      <Link
                        href={`/messages?booking=${booking.id}`}
                        className="btn-secondary w-full flex items-center justify-center"
                      >
                        <ChatBubbleLeftIcon className="mr-2 h-5 w-5" />
                        Contact Host
                      </Link>
                      {booking.status === 'confirmed' && (
                        <Link
                          href={`/bookings/${booking.id}/receipt`}
                          className="btn-secondary w-full flex items-center justify-center"
                        >
                          <DocumentTextIcon className="mr-2 h-5 w-5" />
                          View Receipt
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                      Important Information
                    </h2>
                    <div className="mt-4 space-y-4 text-sm text-gray-600">
                      <p>
                        • Check-in/Start time: {booking.startTime || 'To be confirmed'}
                      </p>
                      <p>
                        • Check-out/End time: {booking.endTime || 'To be confirmed'}
                      </p>
                      <p>
                        • Booking reference: {booking.bookingReference}
                      </p>
                      <p>
                        • Confirmation sent to: {booking.confirmationEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}