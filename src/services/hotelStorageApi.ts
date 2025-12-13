// Hotel Storage API - Save hotel and room details to custom backend

const PROXY_BASE_URL = '/api';

export interface HotelData {
  hotel_code: string;
  name: string;
  rating: number;
  address: string;
  city_id: string;
  country_code: string;
  map_lat: number;
  map_lon: number;
  facilities: {
    wifi?: boolean;
    pool?: boolean;
    parking?: boolean;
    gym?: boolean;
    [key: string]: boolean | undefined;
  };
  images: string[];
}

export interface RoomData {
  room_id: string;
  hotel_code: string;
  booking_code: string;
  room_name: string;
  base_price: number;
  total_fare: number;
  currency: string;
  is_refundable: boolean;
  day_rates: {
    [date: string]: number;
  };
  extras: {
    breakfast?: boolean;
    wifi?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

// Add hotel to custom backend
export const addHotel = async (hotelData: HotelData): Promise<ApiResponse> => {
  try {
    console.log('🏨 Adding hotel to backend:', hotelData.hotel_code);
    console.log('📤 Sending hotel data:', JSON.stringify(hotelData, null, 2));
    
    const response = await fetch(`${PROXY_BASE_URL}/hotel/add-hotel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData),
    });

    console.log('📥 Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Add hotel error:', errorText);
      throw new Error(`Failed to add hotel: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    console.log('✅ Hotel added successfully');
    return data;
  } catch (error) {
    console.error('❌ Add hotel error:', error);
    throw error;
  }
};

// Add room to custom backend
export const addRoom = async (roomData: RoomData): Promise<ApiResponse> => {
  try {
    console.log('🛏️ Adding room to backend:', roomData.room_id);
    
    const response = await fetch(`${PROXY_BASE_URL}/hotelRoom/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Add room error:', errorText);
      throw new Error(`Failed to add room: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    console.log('✅ Room added successfully');
    return data;
  } catch (error) {
    console.error('❌ Add room error:', error);
    throw error;
  }
};

// Transform hotel detail API response to custom backend format
export const transformHotelData = (hotelDetail: any): HotelData => {
  console.log('🔄 Transforming hotel data:', hotelDetail);
  
  // Extract hotel code
  const hotelCode = hotelDetail.HotelCode || hotelDetail.TBOHotelCode || hotelDetail.hotel_code || 'UNKNOWN';
  
  // Safely handle facilities array
  const facilities = Array.isArray(hotelDetail.Facilities) ? hotelDetail.Facilities : [];
  
  // Parse coordinates with fallback to Dubai center if not available
  let lat = parseFloat(String(hotelDetail.Latitude || hotelDetail.map_lat || '0'));
  let lon = parseFloat(String(hotelDetail.Longitude || hotelDetail.map_lon || '0'));
  
  // If coordinates are invalid (0,0), use Dubai center as default
  if (lat === 0 && lon === 0) {
    lat = 25.2048; // Dubai latitude
    lon = 55.2708; // Dubai longitude
  }
  
  const transformed = {
    hotel_code: String(hotelCode),
    name: hotelDetail.HotelName || hotelDetail.name || `Hotel ${hotelCode}`,
    rating: parseInt(String(hotelDetail.StarRating || hotelDetail.Rating || hotelDetail.rating || '3'), 10) || 3,
    address: hotelDetail.HotelAddress || hotelDetail.Address || hotelDetail.address || 'N/A',
    city_id: hotelDetail.HotelCity || hotelDetail.City || hotelDetail.city_id || 'DXB',
    country_code: hotelDetail.CountryCode || hotelDetail.Country || hotelDetail.country_code || 'AE',
    map_lat: lat,
    map_lon: lon,
    facilities: {
      wifi: facilities.some((f: any) => 
        String(f).toLowerCase().includes('wifi') || String(f).toLowerCase().includes('internet')
      ),
      pool: facilities.some((f: any) => 
        String(f).toLowerCase().includes('pool') || String(f).toLowerCase().includes('swimming')
      ),
      parking: facilities.some((f: any) => 
        String(f).toLowerCase().includes('parking')
      ),
      gym: facilities.some((f: any) => 
        String(f).toLowerCase().includes('gym') || String(f).toLowerCase().includes('fitness')
      ),
    },
    images: Array.isArray(hotelDetail.HotelImages) ? hotelDetail.HotelImages : 
            Array.isArray(hotelDetail.Images) ? hotelDetail.Images : 
            Array.isArray(hotelDetail.images) ? hotelDetail.images : [],
  };
  
  console.log('✅ Transformed hotel data:', JSON.stringify(transformed, null, 2));
  return transformed;
};

// Transform room detail API response to custom backend format
export const transformRoomData = (
  roomDetail: any,
  hotelCode: string,
  bookingCode: string
): RoomData => {
  console.log('🔄 Transforming room data:', roomDetail);
  console.log('🔑 Hotel Code:', hotelCode);
  console.log('🔑 Booking Code:', bookingCode);
  
  // Handle IsRefundable being a string 'true'/'false' or boolean
  const isRefundable = roomDetail.IsRefundable === 'true' || roomDetail.IsRefundable === true;
  
  const transformed = {
    room_id: roomDetail.RoomId || roomDetail.RoomTypeCode || `ROOM_${Date.now()}`,
    hotel_code: hotelCode,
    booking_code: bookingCode,
    room_name: roomDetail.Name || roomDetail.RoomTypeName || roomDetail.RoomName || 'Room',
    base_price: parseFloat(roomDetail.BasePrice || roomDetail.Price?.PublishedPrice || roomDetail.TotalFare || '0'),
    total_fare: parseFloat(roomDetail.TotalFare || roomDetail.Price?.OfferedPrice || '0'),
    currency: roomDetail.Currency || roomDetail.Price?.CurrencyCode || 'USD',
    is_refundable: isRefundable,
    day_rates: roomDetail.DayRates || {},
    extras: {
      breakfast: roomDetail.Inclusion?.toLowerCase().includes('breakfast') || 
                roomDetail.MealType?.toLowerCase().includes('breakfast') || false,
      wifi: roomDetail.Inclusion?.toLowerCase().includes('wifi') || false,
    },
  };
  
  console.log('✅ Transformed room data:', transformed);
  return transformed;
};

// Store hotel and room details (call both APIs in sequence)
export const storeHotelAndRoom = async (
  hotelDetail: any,
  roomDetail: any,
  bookingCode: string
): Promise<{ hotelSuccess: boolean; roomSuccess: boolean }> => {
  try {
    console.log('📦 Starting hotel and room storage...');
    console.log('📊 Hotel detail input:', hotelDetail);
    console.log('📊 Room detail input:', roomDetail);
    
    // Step 1: Transform and add hotel
    console.log('🔄 Step 1: Transforming and storing hotel...');
    const hotelData = transformHotelData(hotelDetail);
    const hotelResult = await addHotel(hotelData);
    
    if (!hotelResult.success) {
      console.error('❌ Hotel storage returned failure:', hotelResult);
      throw new Error('Hotel storage failed');
    }
    
    console.log('✅ Hotel stored successfully');
    
    // Step 2: Transform and add room
    console.log('🔄 Step 2: Transforming and storing room...');
    const roomData = transformRoomData(roomDetail, hotelData.hotel_code, bookingCode);
    const roomResult = await addRoom(roomData);
    
    if (!roomResult.success) {
      throw new Error('Room storage failed');
    }
    
    console.log('✅ Room stored successfully');
    
    return {
      hotelSuccess: true,
      roomSuccess: true,
    };
  } catch (error) {
    console.error('❌ Store hotel and room error:', error);
    throw error;
  }
};
