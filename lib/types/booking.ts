export type BookingType = 'property' | 'service' | 'leisure';

export interface BookingSlot {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  available: boolean;
  maxGuests: number;
  currentBookings: number;
  price: number;
  currency: string;
}

export interface BookingRequest {
  itemId: string;
  itemType: BookingType;
  date: string;
  startTime?: string;
  endTime?: string;
  guests: number;
  specialRequests?: string;
  userId: string;
}

export interface BookingResponse {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentRequired: boolean;
  paymentAmount: number;
  paymentCurrency: string;
  paymentUrl?: string;
  bookingReference: string;
  confirmationEmail?: string;
}

export interface BookingError {
  code: string;
  message: string;
  field?: string;
}

export interface AvailabilityRequest {
  itemId: string;
  itemType: BookingType;
  startDate: string;
  endDate: string;
  guests?: number;
}

export interface AvailabilityResponse {
  available: boolean;
  slots: BookingSlot[];
  pricing: {
    basePrice: number;
    currency: string;
    additionalFees?: {
      name: string;
      amount: number;
    }[];
  };
}