// Wishlist API service

const PROXY_BASE_URL = '/api';

export interface WishlistItem {
  wishlist_id?: string;
  'Wishlist ID'?: string;
  customer_id?: string;
  'Customer ID'?: string;
  hotel_code?: string;
  'Hotel Code'?: string;
  hotel_name?: string;
  'Hotel Name'?: string;
  hotel_rating?: number;
  'Hotel Rating'?: number;
  address?: string;
  'Address'?: string;
  city?: string;
  'City'?: string;
  country?: string;
  'Country'?: string;
  price?: number;
  'Price'?: number;
  currency?: string;
  'Currency'?: string;
  image_url?: string;
  'Image URL'?: string;
  search_params?: string;
  'Search Params'?: string;
  created_at?: string;
  'Created At'?: string;
}

export interface AddToWishlistRequest {
  customer_id: string;
  hotel_code: string;
  hotel_name?: string;
  hotel_rating?: number;
  address?: string;
  city?: string;
  country?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  search_params?: {
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    adults?: string;
    children?: string;
    rooms?: string;
    childrenAges?: string;
    roomGuests?: string;
  };
}

export interface WishlistResponse {
  success: boolean;
  message?: string;
  data?: WishlistItem[];
  count?: number;
}

// Add hotel to wishlist
export const addToWishlist = async (
  wishlistData: AddToWishlistRequest
): Promise<WishlistResponse> => {
  try {
    console.log('💖 Adding hotel to wishlist:', wishlistData);

    const response = await fetch(`${PROXY_BASE_URL}/wishlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wishlistData),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Failed to add to wishlist: ${response.status} ${response.statusText}`);
    }

    const data: WishlistResponse = await response.json();
    console.log('✅ Hotel added to wishlist successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    throw error;
  }
};

// Get customer's wishlist
export const getWishlist = async (
  customerId: string
): Promise<WishlistResponse> => {
  try {
    console.log('📋 Fetching wishlist for customer:', customerId);

    const response = await fetch(`${PROXY_BASE_URL}/wishlist/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Failed to fetch wishlist: ${response.status} ${response.statusText}`);
    }

    const data: WishlistResponse = await response.json();
    console.log('✅ Wishlist fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Fetch wishlist error:', error);
    throw error;
  }
};

// Remove hotel from wishlist
export const removeFromWishlist = async (
  customerId: string,
  hotelCode: string
): Promise<WishlistResponse> => {
  try {
    console.log('🗑️ Removing hotel from wishlist:', { customerId, hotelCode });

    const response = await fetch(`${PROXY_BASE_URL}/wishlist/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        hotel_code: hotelCode,
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Failed to remove from wishlist: ${response.status} ${response.statusText}`);
    }

    const data: WishlistResponse = await response.json();
    console.log('✅ Hotel removed from wishlist successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    throw error;
  }
};

// Check if hotel is in wishlist
export const isHotelInWishlist = async (
  customerId: string,
  hotelCode: string
): Promise<boolean> => {
  try {
    const wishlistResponse = await getWishlist(customerId);
    
    if (wishlistResponse.success && wishlistResponse.data) {
      return wishlistResponse.data.some(
        (item) => item['Hotel Code'] === hotelCode
      );
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking wishlist:', error);
    return false;
  }
};
