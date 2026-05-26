import { HotelSearchParams, HotelResult, HotelSearchResponse } from './hotelApi';

// ElasticBean API Configuration
const ELASTICBEAN_API_URL = import.meta.env.VITE_ELASTICBEAN_API_URL || 'https://your-elasticbean-api.amazonaws.com';
const ELASTICBEAN_API_KEY = import.meta.env.VITE_ELASTICBEAN_API_KEY || '';

// Interface for ElasticBean hotel data from your database
export interface ElasticBeanHotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  star_rating: string;
  images: string[];
  description?: string;
  amenities?: string[];
  location?: {
    Latitude: number;
    Longitude: number;
  };
  hotel_code?: string; // Mapping to live API hotel code
}

// Interface for ElasticBean search response
export interface ElasticBeanSearchResponse {
  success: boolean;
  data: ElasticBeanHotel[];
  message?: string;
  total?: number;
}

// Search hotels from ElasticBean database
export const searchElasticBeanHotels = async (
  params: {
    city?: string;
    country?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    rooms?: number;
    limit?: number;
    offset?: number;
  }
): Promise<ElasticBeanSearchResponse> => {
  try {
    console.log('🔍 Searching ElasticBean API with params:', params);

    const response = await fetch(`${ELASTICBEAN_API_URL}/hotels/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELASTICBEAN_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`ElasticBean API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ ElasticBean API response:', data);

    return data;
  } catch (error) {
    console.error('❌ ElasticBean API error:', error);
    throw error;
  }
};

// Get single hotel details from ElasticBean
export const getElasticBeanHotelDetails = async (
  hotelId: string
): Promise<ElasticBeanHotel> => {
  try {
    console.log('🏨 Getting hotel details from ElasticBean:', hotelId);

    const response = await fetch(`${ELASTICBEAN_API_URL}/hotels/${hotelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ELASTICBEAN_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`ElasticBean API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ ElasticBean hotel details:', data);

    return data.data || data;
  } catch (error) {
    console.error('❌ ElasticBean hotel details error:', error);
    throw error;
  }
};

// Convert ElasticBean hotel to HotelResult format
export const convertElasticBeanToHotelResult = (
  elasticBeanHotel: ElasticBeanHotel
): HotelResult => {
  return {
    HotelCode: elasticBeanHotel.hotel_code || elasticBeanHotel.id,
    HotelName: elasticBeanHotel.name,
    Address: elasticBeanHotel.address,
    StarRating: elasticBeanHotel.star_rating,
    FrontImage: elasticBeanHotel.images?.[0] || '',
    Description: elasticBeanHotel.description,
    Amenities: elasticBeanHotel.amenities,
    Location: elasticBeanHotel.location,
    // Price and availability will come from live API
    Price: undefined,
    Currency: undefined,
    RoomType: undefined,
    MealType: undefined,
    Refundable: undefined,
    CancellationPolicy: undefined,
    Rooms: undefined,
  };
};

// Hybrid search: Get hotel data from ElasticBean, pricing from live API
export const searchHotelsHybrid = async (
  params: HotelSearchParams
): Promise<HotelSearchResponse> => {
  try {
    console.log('🔄 Starting hybrid search - ElasticBean + Live API');

    // Step 1: Get hotel data from ElasticBean database
    const elasticBeanParams = {
      city: params.CityCode ? params.CityCode : undefined,
      check_in: params.CheckIn,
      check_out: params.CheckOut,
      guests: params.PaxRooms?.reduce((sum, room) => sum + room.Adults + room.Children, 0),
      rooms: params.PaxRooms?.length,
      limit: 50, // Limit results for performance
    };

    const elasticBeanResponse = await searchElasticBeanHotels(elasticBeanParams);
    
    if (!elasticBeanResponse.success || !elasticBeanResponse.data?.length) {
      console.log('📭 No hotels found in ElasticBean, falling back to live API only');
      // Fallback to live API only
      return await import('./hotelApi').then(module => module.searchHotels(params));
    }

    console.log(`✅ Found ${elasticBeanResponse.data.length} hotels in ElasticBean database`);

    // Step 2: Convert ElasticBean hotels to HotelResult format
    const hotelResults = elasticBeanResponse.data.map(convertElasticBeanToHotelResult);

    // Step 3: Get pricing and availability from live API for hotels with hotel codes
    const hotelsWithCodes = hotelResults.filter(hotel => hotel.HotelCode);
    
    if (hotelsWithCodes.length > 0) {
      console.log(`💰 Getting pricing from live API for ${hotelsWithCodes.length} hotels`);
      
      try {
        // Create params for live API pricing
        const liveApiParams = {
          ...params,
          HotelCodes: hotelsWithCodes.map(h => h.HotelCode).join(','),
          CityCode: undefined, // Use hotel codes instead
        };

        const liveApiResponse = await import('./hotelApi').then(module => module.searchHotels(liveApiParams));
        
        // Merge pricing data from live API with hotel data from ElasticBean
        const liveHotels = Array.isArray(liveApiResponse.HotelResult) 
          ? liveApiResponse.HotelResult 
          : [liveApiResponse.HotelResult];

        // Create a map of hotel codes to pricing data
        const pricingMap = new Map();
        liveHotels.forEach(liveHotel => {
          if (liveHotel.HotelCode) {
            pricingMap.set(liveHotel.HotelCode, {
              Price: liveHotel.Price,
              Currency: liveHotel.Currency,
              Rooms: liveHotel.Rooms,
              RoomType: liveHotel.RoomType,
              MealType: liveHotel.MealType,
              Refundable: liveHotel.Refundable,
              CancellationPolicy: liveHotel.CancellationPolicy,
            });
          }
        });

        // Merge pricing data into ElasticBean hotels
        const mergedResults = hotelResults.map(hotel => {
          const pricingData = pricingMap.get(hotel.HotelCode);
          if (pricingData) {
            return {
              ...hotel,
              ...pricingData,
            };
          }
          return hotel; // Return without pricing if not found in live API
        });

        console.log('✅ Hybrid search completed successfully');
        
        return {
          Status: {
            Code: "200",
            Description: "Hybrid search completed successfully",
          },
          HotelResult: mergedResults,
        };
      } catch (liveApiError) {
        console.warn('⚠️ Live API pricing failed, returning ElasticBean data without pricing:', liveApiError);
        
        // Return ElasticBean data without pricing
        return {
          Status: {
            Code: "206", // Partial content
            Description: "Hotel data loaded from database, pricing unavailable",
          },
          HotelResult: hotelResults,
        };
      }
    } else {
      console.log('📭 No hotel codes available for live API pricing');
      
      // Return ElasticBean data without pricing
      return {
        Status: {
          Code: "206", // Partial content
          Description: "Hotel data loaded from database, pricing unavailable",
        },
        HotelResult: hotelResults,
      };
    }
  } catch (error) {
    console.error('❌ Hybrid search failed:', error);
    
    // Final fallback to live API only
    console.log('🔄 Falling back to live API only');
    return await import('./hotelApi').then(module => module.searchHotels(params));
  }
};
