// Service for fetching booking details

const BOOKING_DETAILS_API_URL = 'https://api.hotelrbs.com/bookings/get';

export interface BookingDetailsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Fetch booking details by booking reference ID
 * @param bookingReferenceId - The booking reference ID (e.g., "BR00666")
 * @returns Promise with booking details
 */
export const getBookingDetails = async (
  bookingReferenceId: string
): Promise<BookingDetailsResponse> => {
  try {
    console.log('📋 Fetching booking details for:', bookingReferenceId);

    const url = `${BOOKING_DETAILS_API_URL}?booking_reference_id=${bookingReferenceId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Booking details fetched:', data);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('❌ Error fetching booking details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch booking details',
    };
  }
};

/**
 * Fetch all bookings for a customer
 * @param customerId - The customer ID
 * @returns Promise with list of bookings
 */
export const getCustomerBookings = async (
  customerId: string
): Promise<BookingDetailsResponse> => {
  try {
    console.log('📋 Fetching bookings for customer:', customerId);

    // This endpoint might need to be adjusted based on your API
    const url = `${BOOKING_DETAILS_API_URL}?customer_id=${customerId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Customer bookings fetched:', data);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('❌ Error fetching customer bookings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer bookings',
    };
  }
};
