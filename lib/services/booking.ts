import { 
  BookingRequest, 
  BookingResponse, 
  AvailabilityRequest, 
  AvailabilityResponse,
  BookingError
} from '../types/booking';

class BookingService {
  private readonly API_BASE_URL = '/api/bookings';

  // Check availability for a specific item
  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  // Create a new booking
  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }

  // Get booking details
  async getBookingDetails(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get booking details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting booking details:', error);
      throw error;
    }
  }

  // Update booking details
  async updateBooking(
    bookingId: string, 
    updates: Partial<BookingRequest>
  ): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Get user's bookings
  async getUserBookings(userId: string): Promise<BookingResponse[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get user bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  // Validate booking request
  validateBookingRequest(request: BookingRequest): BookingError[] {
    const errors: BookingError[] = [];

    if (!request.itemId) {
      errors.push({
        code: 'INVALID_ITEM_ID',
        message: 'Item ID is required',
        field: 'itemId',
      });
    }

    if (!request.date) {
      errors.push({
        code: 'INVALID_DATE',
        message: 'Date is required',
        field: 'date',
      });
    }

    if (request.guests < 1) {
      errors.push({
        code: 'INVALID_GUESTS',
        message: 'Number of guests must be at least 1',
        field: 'guests',
      });
    }

    if (!request.userId) {
      errors.push({
        code: 'INVALID_USER_ID',
        message: 'User ID is required',
        field: 'userId',
      });
    }

    return errors;
  }
}

export const bookingService = new BookingService();