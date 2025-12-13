import { APP_CONFIG } from "@/config/constants";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://pfort.travelapihost.com/HotelServiceRest";
const PROXY_SERVER_URL =
  import.meta.env.VITE_PROXY_SERVER_URL || "http://localhost:3001/api";
const API_USERNAME = import.meta.env.VITE_API_USERNAME || "";
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD || "";

const getApiUrl = (endpoint: string) => {
  return `${PROXY_SERVER_URL}${endpoint}`;
};
const authHeader = btoa(`${API_USERNAME}:${API_PASSWORD}`);
export interface HotelSearchParams {
  CheckIn: string;
  CheckOut: string;
  HotelCodes?: string;
  CityCode?: string;
  GuestNationality: string;
  PreferredCurrencyCode: string;
  PaxRooms: Array<{
    Adults: number;
    Children: number;
    ChildrenAges: number[];
  }>;
  IsDetailResponse?: boolean;
  ResponseTime?: number;
  Filters?: {
    MealType: string;
    Refundable: string;
    NoOfRooms: number;
  };
}

export interface HotelResult {
  HotelCode: string;
  HotelName: string;
  Address: string;
  StarRating: string;
  FrontImage: string;
  Price?: number;
  Currency?: string;
  RoomType?: string;
  MealType?: string;
  Refundable?: boolean;
  CancellationPolicy?: string;
  Amenities?: string[];
  Description?: string;
  Location?: {
    Latitude: number;
    Longitude: number;
  };
  Rooms?: Array<{
    BookingCode: string;
    RoomType: string;
    Price: number;
    Currency: string;
    Refundable: boolean;
    MealType?: string;
    CancellationPolicy?: string;
  }>;
}

export interface HotelSearchResponse {
  Status: {
    Code: string | number;
    Description: string;
  };
  HotelResult: HotelResult[] | HotelResult;
}

// Search hotels using Travzilla API - NO MOCK DATA
export const searchHotels = async (
  params: HotelSearchParams
): Promise<HotelSearchResponse> => {
  try {
    console.log("🔍 Calling Travzilla API with params:", params);

    // Always use real Travzilla API - no fallback to mock data
    return await searchHotelsTravzilla(params);
  } catch (error) {
    console.error("💥 Hotel search error:", error);
    throw error;
  }
};

// Real API integration with Travzilla via local proxy
const searchHotelsTravzilla = async (
  params: HotelSearchParams
): Promise<HotelSearchResponse> => {
  try {
    console.log("🌐 Calling Travzilla API via local proxy...");
    console.log("🌐 searchHotelsTravzilla called with params:", params);
    const proxyUrl = getApiUrl("/hotel-search");
    console.log("📍 Proxy URL:", proxyUrl);
    console.log("📤 FULL Request Body for comparison with Postman:", JSON.stringify(params, null, 2));
    console.log("📤 Request keys:", Object.keys(params));
    console.log("📤 CheckIn:", params.CheckIn);
    console.log("📤 CheckOut:", params.CheckOut);
    console.log("📤 CityCode:", params.CityCode);
    console.log("📤 HotelCodes:", params.HotelCodes);
    console.log("📤 GuestNationality:", params.GuestNationality);
    console.log("📤 PreferredCurrencyCode:", params.PreferredCurrencyCode);
    console.log("📤 ResponseTime:", params.ResponseTime);
    console.log("📤 PaxRooms:", JSON.stringify(params.PaxRooms, null, 2));
    console.log("🔍 Environment check - PROXY_SERVER_URL:", PROXY_SERVER_URL);

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    console.log("📥 Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Proxy response error:", errorText);
      throw new Error(
        `Proxy server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla API response:", data);
    console.log("✅ Travzilla API FULL response JSON:", JSON.stringify(data, null, 2));
    console.log("✅ Travzilla API response type:", typeof data);
    console.log("✅ Travzilla API response keys:", Object.keys(data || {}));
    console.log("✅ Has Status?", !!data?.Status);
    console.log("✅ Has HotelResult?", !!data?.HotelResult);
    console.log("✅ Status object:", data?.Status);
    console.log("✅ HotelResult value:", data?.HotelResult);
    console.log("✅ HotelResult type:", typeof data?.HotelResult);
    console.log("✅ HotelResult is array?", Array.isArray(data?.HotelResult));

    // Handle null response (no hotels found)
    if (data === null || data === undefined) {
      console.log("📭 No hotels found for this search - data is null/undefined");
      return {
        Status: {
          Code: "204",
          Description: "No results found for the requested search",
        },
        HotelResult: [],
      };
    }

    // Check if the response has the expected structure
    if (data.Status && data.HotelResult) {
      console.log("✅ Response has expected structure (Status + HotelResult)");
      // Ensure HotelResult is an array
      let hotelResults = data.HotelResult;
      if (!Array.isArray(hotelResults)) {
        console.log(
          "📋 HotelResult is not an array, converting...",
          typeof hotelResults
        );
        if (typeof hotelResults === "object" && hotelResults !== null) {
          // Convert single hotel object to array
          hotelResults = [hotelResults];
        } else {
          hotelResults = [];
        }
      }

      // Process hotel results to extract room data and booking codes
      const processedHotels = hotelResults.map((hotel: any) => {
        if (hotel.Rooms) {
          // Process rooms data to extract booking codes
          // Preserve the original Rooms object structure - don't convert to array
          // The Rooms object contains TotalFare which we need for pricing
          return {
            ...hotel,
            // Keep Rooms as-is since it contains the pricing information
          };
        }
        return hotel;
      });

      return {
        ...data,
        HotelResult: processedHotels,
      };
    } else {
      // Transform response if needed - handle different response structures
      console.log("⚠️ Response structure is different than expected");
      console.log("⚠️ Attempting to transform response...");
      console.log("⚠️ Available keys in data:", Object.keys(data || {}));
      
      // Try to find hotels in different possible locations
      let hotelResults = [];
      if (data.HotelResult) {
        hotelResults = Array.isArray(data.HotelResult) ? data.HotelResult : [data.HotelResult];
      } else if (data.hotels) {
        hotelResults = Array.isArray(data.hotels) ? data.hotels : [data.hotels];
      } else if (Array.isArray(data)) {
        hotelResults = data;
      }
      
      console.log("⚠️ Extracted hotelResults:", hotelResults);
      console.log("⚠️ hotelResults length:", hotelResults.length);
      
      return {
        Status: data.Status || {
          Code: "200",
          Description: "Successful",
        },
        HotelResult: hotelResults,
      };
    }
  } catch (error) {
    console.error("💥 Proxy API error:", error);
    console.error("💥 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw new Error(
      `Travzilla API failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get hotel details by code using proxy server
// export const getHotelDetails = async (hotelCode: string): Promise<any> => {
//   try {
//     console.log('🔍 Fetching hotel details for:', hotelCode);

//     const response = await fetch(`${PROXY_SERVER_URL}/hotel-details`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({ HotelCode: Number(hotelCode) ,Language : 'EN'}),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ Hotel details error:', errorText);
//       throw new Error(`Hotel details error: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log('✅ Hotel details response:', data);
//     return data;
//   } catch (error) {
//     console.error('💥 Hotel details error:', error);
//     throw error;
//   }
// };

export const getHotelDetails = async (hotelCode: string, language?: string): Promise<any> => {
  try {
    console.log("🔍 Fetching hotel details for:", hotelCode);
    console.log("🔍 HotelCode type:", typeof hotelCode);
    console.log("🔍 HotelCode value:", hotelCode);
    
    // Ensure hotelCode is not empty
    if (!hotelCode || hotelCode.trim() === "") {
      throw new Error("HotelCode is required and cannot be empty");
    }
    
    // Get language from parameter or localStorage
    const lang = language || localStorage.getItem("language") || "en";
    // Map language code for API (ar, en, fr)
    const apiLang = lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en";

    const requestBody = { HotelCode: hotelCode, Language: apiLang };
    console.log("📤 Request body being sent:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${PROXY_SERVER_URL}/hotel-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Hotel details error:", errorText);
      throw new Error(
        `Hotel details error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Hotel details FULL response:", JSON.stringify(data, null, 2));
    console.log("✅ Response Status:", data?.Status);
    console.log("✅ Response Status Code:", data?.Status?.Code);
    console.log("✅ Response keys:", Object.keys(data || {}));
    console.log("✅ Response keys:", Object.keys(data || {}));
    console.log("✅ HotelDetails exists:", !!data?.HotelDetails);
    console.log("✅ HotelGuests exists:", !!data?.HotelGuests);
    console.log("✅ HotelResult exists:", !!data?.HotelResult);
    
    // First, try to extract hotel data from response (even if status is error)
    // Check HotelDetails FIRST (this is what the hotel details API returns)
    let hotelDetails = null;
    
    if (data?.HotelDetails) {
      console.log("✅ API returned HotelDetails, extracting hotel...");
      console.log("✅ HotelDetails type:", typeof data.HotelDetails);
      console.log("✅ HotelDetails is array:", Array.isArray(data.HotelDetails));
      hotelDetails = data.HotelDetails;
      console.log("✅ Extracted hotel from HotelDetails:", hotelDetails?.HotelCode, hotelDetails?.HotelName);
    }
    // Check HotelResult (from search API)
    else if (data?.HotelResult) {
      console.log("✅ API returned HotelResult, extracting hotel...");
      console.log("✅ HotelResult type:", typeof data.HotelResult);
      console.log("✅ HotelResult is array:", Array.isArray(data.HotelResult));
      const hotelResult = data.HotelResult;
      
      // Handle array format (from search API)
      if (Array.isArray(hotelResult) && hotelResult.length > 0) {
        hotelDetails = hotelResult[0]; // Take the first hotel
        console.log("✅ Extracted hotel from HotelResult array:", hotelDetails?.HotelCode);
      } 
      // Handle single object format
      else if (hotelResult && typeof hotelResult === 'object') {
        // Check if it's not an array (arrays are objects too)
        if (!Array.isArray(hotelResult)) {
          hotelDetails = hotelResult;
          console.log("✅ Extracted hotel from HotelResult object:", hotelDetails?.HotelCode, hotelDetails?.HotelName);
        }
      }
    }
    // Fallback to HotelGuests if HotelDetails and HotelResult not found
    else if (data?.HotelGuests) {
      console.log("✅ Using HotelGuests field from response");
      hotelDetails = data.HotelGuests;
    }
    
    // Final fallback
    if (!hotelDetails) {
      hotelDetails = data?.hotelDetails || data?.Hotel || data?.hotel;
    }
    
    // If hotelDetails is the entire response and it has HotelCode, it's the hotel object
    if (!hotelDetails && data && data.HotelCode) {
      hotelDetails = data;
      console.log("✅ Using entire response as hotel details:", hotelDetails?.HotelCode);
    }
    
    // Check if we successfully extracted hotel details
    if (!hotelDetails || (typeof hotelDetails === 'object' && Object.keys(hotelDetails).length === 0)) {
      console.log("⚠️ HotelDetails field is missing or null in response");
      console.log("⚠️ Available data keys:", Object.keys(data || {}));
      
      // Now check Status and throw appropriate error
      if (data?.Status) {
        const statusCode = String(data.Status.Code);
        const statusDescription = data.Status.Description || "";
        
        console.log("❌ Status Code:", statusCode);
        console.log("❌ Status Description:", statusDescription);
        
        if (statusCode === "204" || statusCode === 204) {
          throw new Error("Hotel not found");
        } else if (statusCode === "201" || statusCode === 201) {
          throw new Error("Hotel found but no rooms available");
        } else {
          throw new Error(statusDescription || `API error: ${statusCode}`);
        }
      }
      
      throw new Error("Hotel details not found in response");
    }
    
    console.log("✅ Final hotel details extracted!");
    console.log("✅ Source:", hotelDetails ? (data?.HotelResult ? "HotelResult" : data?.HotelGuests ? "HotelGuests" : "Other") : "none");
    console.log("✅ Hotel Code:", hotelDetails?.HotelCode);
    console.log("✅ Hotel Name:", hotelDetails?.HotelName);
    console.log("✅ ALL Hotel Details keys:", hotelDetails ? Object.keys(hotelDetails) : "none");
    console.log("✅ FULL Hotel Details object:", JSON.stringify(hotelDetails, null, 2));
    console.log("✅ Images field:", hotelDetails?.Images);
    console.log("✅ Images type:", typeof hotelDetails?.Images);
    console.log("✅ Images is array:", Array.isArray(hotelDetails?.Images));
    console.log("✅ HotelFacilities:", hotelDetails?.HotelFacilities);
    console.log("✅ Amenities:", hotelDetails?.Amenities);
    console.log("✅ PhoneNumber:", hotelDetails?.PhoneNumber);
    console.log("✅ FaxNumber:", hotelDetails?.FaxNumber);
    console.log("✅ CheckInTime:", hotelDetails?.CheckInTime);
    console.log("✅ CheckOutTime:", hotelDetails?.CheckOutTime);
    console.log("✅ Map/Coordinates:", hotelDetails?.Map);
    console.log("✅ CityId:", hotelDetails?.CityId);
    console.log("✅ CountryCode:", hotelDetails?.CountryCode);
    console.log("✅ Description:", hotelDetails?.Description?.substring(0, 200));
    
    // Normalize Images field - check multiple possible field names
    if (hotelDetails) {
      let imagesArray: string[] = [];
      
      // Check various possible image field names
      if (hotelDetails.Images) {
        if (Array.isArray(hotelDetails.Images)) {
          imagesArray = hotelDetails.Images.filter((img: any) => typeof img === 'string');
        } else if (typeof hotelDetails.Images === 'string') {
          imagesArray = [hotelDetails.Images];
        } else if (typeof hotelDetails.Images === 'object') {
          imagesArray = Object.values(hotelDetails.Images).filter((img: any) => 
            typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:'))
          ) as string[];
        }
      } else if ((hotelDetails as any).HotelImages) {
        const hotelImages = (hotelDetails as any).HotelImages;
        if (Array.isArray(hotelImages)) {
          imagesArray = hotelImages.filter((img: any) => typeof img === 'string');
        } else if (typeof hotelImages === 'string') {
          imagesArray = [hotelImages];
        }
      } else if ((hotelDetails as any).ImageList) {
        const imageList = (hotelDetails as any).ImageList;
        if (Array.isArray(imageList)) {
          imagesArray = imageList.filter((img: any) => typeof img === 'string');
        }
      }
      
      // Set normalized Images array
      if (imagesArray.length > 0) {
        hotelDetails.Images = imagesArray;
        console.log(`✅ Normalized Images array with ${imagesArray.length} images`);
      }
      
      // Ensure FrontImage is set
      if (!hotelDetails.FrontImage && imagesArray.length > 0) {
        hotelDetails.FrontImage = imagesArray[0];
      }
      
      // Normalize HotelFacilities/Amenities - check multiple possible field names
      let facilitiesArray: string[] = [];
      
      if (hotelDetails.HotelFacilities) {
        if (Array.isArray(hotelDetails.HotelFacilities)) {
          facilitiesArray = hotelDetails.HotelFacilities.filter((f: any) => typeof f === 'string');
        } else if (typeof hotelDetails.HotelFacilities === 'string') {
          facilitiesArray = hotelDetails.HotelFacilities.split(',').map(a => a.trim());
        }
      } else if ((hotelDetails as any).Amenities) {
        const amenities = (hotelDetails as any).Amenities;
        if (Array.isArray(amenities)) {
          facilitiesArray = amenities.filter((f: any) => typeof f === 'string');
        } else if (typeof amenities === 'string') {
          facilitiesArray = amenities.split(',').map(a => a.trim());
        }
      } else if ((hotelDetails as any).Facilities) {
        const facilities = (hotelDetails as any).Facilities;
        if (Array.isArray(facilities)) {
          facilitiesArray = facilities.filter((f: any) => typeof f === 'string');
        } else if (typeof facilities === 'string') {
          facilitiesArray = facilities.split(',').map(a => a.trim());
        }
      }
      
      // Set normalized HotelFacilities array
      if (facilitiesArray.length > 0) {
        hotelDetails.HotelFacilities = facilitiesArray;
        console.log(`✅ Normalized HotelFacilities array with ${facilitiesArray.length} facilities`);
      }
    }
    
    // Return in expected format (always as HotelDetails for consistency)
    const returnValue = {
      Status: data.Status,
      HotelDetails: hotelDetails
    };
    
    console.log("✅ Returning response with HotelDetails:", !!returnValue.HotelDetails);
    console.log("✅ Final Images array length:", hotelDetails?.Images?.length || 0);
    return returnValue;
  } catch (error) {
    console.error("💥 Hotel details error:", error);
    throw error;
  }
};

// Get room availability
export const getRoomAvailability = async (
  hotelCode: string,
  checkIn: string,
  checkOut: string
): Promise<any> => {
  try {
    console.log("🔍 Getting room availability for:", hotelCode);

    const response = await fetch(`${PROXY_SERVER_URL}/room-availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        HotelCode: hotelCode,
        CheckIn: checkIn,
        CheckOut: checkOut,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Room availability error:", errorText);
      throw new Error(
        `Room availability error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Room availability response:", data);
    return data;
  } catch (error) {
    console.error("💥 Room availability error:", error);
    throw error;
  }
};

// Get hotel room details using booking code with timeout and optimization
export const getHotelRoomDetails = async (bookingCode, timeout = 15000) => {
  try {
    console.log('🔍 Getting room details for booking code:', bookingCode);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(`${PROXY_SERVER_URL}/hotel-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ BookingCode: bookingCode }),
        signal: controller.signal, // Add abort signal for timeout
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Room details error:', errorText);
        throw new Error(`Room details error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Room details response:', data);
      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: Room details took too long to load');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('💥 Room details error:', error);
    throw error;
  }
};