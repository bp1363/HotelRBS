// Bookings API service

const PROXY_BASE_URL = '/api'; // Use relative URL for Vite proxy
const CUSTOM_BOOKING_API_BASE = 'https://api.hotelrbs.com'; // Custom booking API

export interface BookingDetailsRequest {
  FromDate: string; // ISO 8601 format: "2023-06-01T20:00:00.000Z"
  ToDate: string;   // ISO 8601 format: "2023-09-30T10:00:00.000Z"
}

export interface BookingItem {
  // Travzilla API field names (BookingDetailsBasedOnDate)
  Index?: number;
  BookingId?: string;
  ConfirmationNo?: string; // Travzilla uses "ConfirmationNo" not "ConfirmationNumber"
  BookingDate?: string;
  Currency?: string;
  AgentMarkup?: string;
  AgencyName?: string;
  BookingStatus?: string;
  BookingPrice?: string;
  TripName?: string;
  TBOHotelCode?: string;
  CheckInDate?: string;
  CheckOutDate?: string;
  ClientReferenceNumber?: string;
  
  // BookingDetail API specific fields
  VoucherStatus?: boolean;
  ConfirmationNumber?: string;
  InvoiceNumber?: string;
  NoOfRooms?: number;
  Inclusion?: string;
  Rating?: string;
  MealType?: string;
  IsRefundable?: boolean;
  TotalTax?: string;
  RoomPromotion?: string;
  RateConditions?: string;
  
  // Additional common fields (for compatibility)
  HotelName?: string;
  HotelCode?: string;
  TotalAmount?: number;
  GuestName?: string;
  RoomType?: string;
  NumberOfRooms?: number;
  NumberOfNights?: number;
  BookingReference?: string;
  CancellationPolicy?: string;
  HotelAddress?: string;
  HotelCity?: string;
  HotelCountry?: string;
  [key: string]: any; // For any additional fields from API
}

export interface BookingDetailsResponse {
  Status?: {
    Code?: string;
    Description?: string;
  };
  BookingDetail?: BookingItem[]; // Travzilla uses "BookingDetail" (singular)
  Bookings?: BookingItem[];
  BookingDetails?: BookingItem[]; // Some APIs might use this
  Data?: BookingItem[]; // Alternative structure
  success?: boolean;
  message?: string;
  [key: string]: any;
}

// Fetch booking details by date range
export const getBookingsByDateRange = async (
  fromDate: string,
  toDate: string
): Promise<BookingDetailsResponse> => {
  try {
    console.log('📅 Fetching bookings for date range:', fromDate, 'to', toDate);
    console.log('🌐 API URL:', `${PROXY_BASE_URL}/booking-details-by-date`);
    
    const response = await fetch(`${PROXY_BASE_URL}/booking-details-by-date`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FromDate: fromDate,
        ToDate: toDate,
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Booking details fetch failed: ${response.status} ${response.statusText}`);
    }

    const data: BookingDetailsResponse = await response.json();
    console.log('✅ Booking details received:', data);
    return data;
  } catch (error) {
    console.error('❌ Booking details error:', error);
    throw error;
  }
};

// Helper function to format date for API (ISO 8601)
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

// Helper function to get default date range (last 6 months to now)
export const getDefaultDateRange = (): { fromDate: string; toDate: string } => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - 6); // 6 months ago
  
  return {
    fromDate: formatDateForAPI(fromDate),
    toDate: formatDateForAPI(toDate),
  };
};

// Fetch booking detail by reference ID
export const getBookingByReferenceId = async (
  bookingReferenceId: string
): Promise<BookingDetailsResponse> => {
  try {
    console.log('🔍 Fetching booking by reference ID:', bookingReferenceId);
    console.log('🌐 API URL:', `${PROXY_BASE_URL}/booking-detail`);
    
    const response = await fetch(`${PROXY_BASE_URL}/booking-detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BookingReferenceId: bookingReferenceId,
        PaymentMode: 'Limit'
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Booking detail fetch failed: ${response.status} ${response.statusText}`);
    }

    const data: BookingDetailsResponse = await response.json();
    console.log('✅ Booking detail received:', data);
    return data;
  } catch (error) {
    console.error('❌ Booking detail error:', error);
    throw error;
  }
};

// Helper to extract bookings array from response (handles different API structures)
export const extractBookings = (response: BookingDetailsResponse): BookingItem[] => {
  console.log('🔍 Extracting bookings from response...');
  console.log('📦 Full response object:', JSON.stringify(response, null, 2));
  console.log('📦 Response keys:', Object.keys(response));
  
  // Try Travzilla's "BookingDetail" field first (singular)
  if (response.BookingDetail && Array.isArray(response.BookingDetail)) {
    console.log('✅ Found bookings in response.BookingDetail (Travzilla format):', response.BookingDetail.length);
    return response.BookingDetail;
  }
  
  // Try other possible structures
  if (response.Bookings && Array.isArray(response.Bookings)) {
    console.log('✅ Found bookings in response.Bookings:', response.Bookings.length);
    return response.Bookings;
  }
  if (response.BookingDetails && Array.isArray(response.BookingDetails)) {
    console.log('✅ Found bookings in response.BookingDetails:', response.BookingDetails.length);
    return response.BookingDetails;
  }
  if (response.Data && Array.isArray(response.Data)) {
    console.log('✅ Found bookings in response.Data:', response.Data.length);
    return response.Data;
  }
  
  // Check if response itself is an array
  if (Array.isArray(response)) {
    console.log('✅ Response itself is an array with', response.length, 'items');
    return response;
  }
  
  // Check for nested structures
  if (response.Status && response.Status.Code === '200') {
    console.log('⚠️ Status is 200 but no bookings found in known fields');
    console.log('⚠️ Available fields:', Object.keys(response));
    console.log('⚠️ Status Description:', response.Status.Description);
    
    // Check if this means "no bookings" vs "error"
    if (response.Status.Description?.toLowerCase().includes('successful')) {
      console.log('✅ API call successful but returned 0 bookings');
      console.log('💡 This usually means:');
      console.log('   1. No bookings exist for this date range');
      console.log('   2. Try searching a wider date range');
      console.log('   3. If you just made a booking, wait 2-5 minutes for it to appear');
    }
  }
  
  console.warn('⚠️ No bookings found in response structure:', response);
  return [];
};

// Custom API: Fetch bookings by customer ID from the custom booking service
export const getBookingFromCustomAPI = async (
  customerId: string
): Promise<any> => {
  try {
    console.log('🔍 Fetching bookings from custom API with customer ID:', customerId);
    
    // Use proxy endpoint with customer_id query parameter (GET request)
    const url = `${PROXY_BASE_URL}/bookings/custom?customer_id=${encodeURIComponent(customerId)}`;
    console.log('🌐 Proxy URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Custom API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Custom API Error Response:', errorText);
      throw new Error(`Custom booking API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Custom booking API response received:', data);
    return data;
  } catch (error) {
    console.error('❌ Custom booking API error:', error);
    throw error;
  }
};

// Add booking details to custom backend after booking completion
export const addBookingToCustomBackend = async (bookingDetails: {
  booking_reference_id: string;
  confirmation_number: string;
  client_reference_id: string;
  customer_id: string;
  agency_name: string;
  hotel_code: string;
  check_in: string;
  check_out: string;
  booking_date: string;
  status: string;
  voucher_status: boolean;
  total_fare: number;
  currency: string;
  no_of_rooms: number;
  invoice_number: string;
}): Promise<any> => {
  try {
    console.log('📝 Adding booking to custom backend:', bookingDetails);
    
    const url = `${PROXY_BASE_URL}/bookings/add`;
    console.log('🌐 Proxy URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDetails),
    });

    console.log('📥 Add booking response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Add booking error response:', errorText);
      throw new Error(`Add booking API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Booking added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Add booking error:', error);
    throw error;
  }
};
