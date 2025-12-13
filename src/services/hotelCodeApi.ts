// API functions for fetching hotel codes dynamically
const PROXY_SERVER_URL = import.meta.env.VITE_PROXY_SERVER_URL || 'http://localhost:3001/api';
const DIRECT_API_URL = 'https://api.hotelrbs.com';

const getApiUrl = (endpoint: string) => {
  return `${PROXY_SERVER_URL}${endpoint}`;
};

const getDirectApiUrl = (endpoint: string) => {
  return `${DIRECT_API_URL}${endpoint}`;
};

// Types for API responses
export interface Country {
  Code: string;
  Name: string;
}

export interface City {
  CityCode: string;
  CityName: string;
  CountryCode: string;
}

// New interface for custom city search API response
export interface CitySearchResult {
  city_code: string;
  city_name: string;
  country_code: string;
  country_name: string;
}

export interface AllCitiesResponse {
  city_name: string;
}

export interface Hotel {
  HotelCode: string;
  HotelName: string;
  CityCode: string;
  CountryCode: string;
}

export interface CountryListResponse {
  Status: {
    Code: string;
    Message: string;
  };
  CountryList: Country[];
}

export interface CityListResponse {
  Status: {
    Code: string;
    Message: string;
  };
  CityList: City[];
}

export interface HotelCodeListResponse {
  Status: {
    Code: string;
    Message: string;
  };
  HotelList: Hotel[];
}

// API functions
export const getCountryList = async (): Promise<CountryListResponse> => {
  try {
    const response = await fetch(getApiUrl('/CountryList'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🌍 Country list response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching country list:', error);
    throw error;
  }
};

export const getCityList = async (countryCode: string): Promise<CityListResponse> => {
  try {
    const response = await fetch(getApiUrl('/CityList'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ CountryCode: countryCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🏙️ City list response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching city list:', error);
    throw error;
  }
};

/**
 * Get hotel codes from custom API
 * POST https://api.hotelrbs.com/hotel/getHotelCodes
 * Body: { "CountryCode": "AE", "CityCode": "AUH" }
 * Response: { "success": true, "country": "AE", "city": "AUH", "hotels": [...] }
 */
export const getHotelCodeList = async (
  countryCode: string, 
  cityCode: string, 
  isDetailedResponse: boolean = false
): Promise<HotelCodeListResponse> => {
  try {
    console.log('🏨 Fetching hotel codes from custom API...', { countryCode, cityCode });
    
    // Call custom API directly (not through proxy)
    const response = await fetch(getDirectApiUrl('/hotel/getHotelCodes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        CountryCode: countryCode,
        CityCode: cityCode
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Custom API hotel codes response:', data);
    
    // Transform custom API response to expected format
    if (data.success && data.hotels && Array.isArray(data.hotels)) {
      const hotelList: Hotel[] = data.hotels.map((hotel: any) => ({
        HotelCode: hotel.hotel_code || hotel.HotelCode || '',
        HotelName: hotel.hotel_name || hotel.HotelName || '',
        CityCode: hotel.city_code || hotel.CityCode || cityCode,
        CountryCode: hotel.country_code || hotel.CountryCode || countryCode,
      }));
      
      const transformedResponse: HotelCodeListResponse = {
        Status: {
          Code: '200',
          Message: 'Successful'
        },
        HotelList: hotelList
      };
      
      console.log(`✅ Transformed ${hotelList.length} hotels from custom API`);
      return transformedResponse;
    } else {
      // Return empty response if no hotels found
      console.log('⚠️ No hotels found in custom API response');
      return {
        Status: {
          Code: '204',
          Message: 'No hotels found'
        },
        HotelList: []
      };
    }
  } catch (error) {
    console.error('❌ Error fetching hotel code list from custom API:', error);
    throw error;
  }
};

// Helper functions
export const getHotelCodesString = (hotels: Hotel[]): string => {
  return hotels.map(hotel => hotel.HotelCode).join(',');
};

export const findCountryCodeByName = (countries: Country[], countryName: string): string | null => {
  const country = countries.find(c => 
    c.CountryName.toLowerCase() === countryName.toLowerCase()
  );
  return country ? country.CountryCode : null;
};

export const findCityCodeByName = (cities: City[], cityName: string): string | null => {
  const city = cities.find(c => 
    c.CityName.toLowerCase() === cityName.toLowerCase()
  );
  return city ? city.CityCode : null;
};

// ============================================
// NEW CUSTOM CITY APIs
// ============================================

/**
 * Get all cities from the custom API
 * GET https://api.hotelrbs.com/city/all
 */
export const getAllCities = async (): Promise<string[]> => {
  try {
    console.log('🌍 Fetching all cities from custom API...');
    const response = await fetch(getDirectApiUrl('/city/all'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ All cities response:', data);
    
    // Extract city names from the response array
    const cityNames = data.map((city: AllCitiesResponse) => city.city_name);
    return cityNames;
  } catch (error) {
    console.error('❌ Error fetching all cities:', error);
    throw error;
  }
};

/**
 * Search for a city by name and get its codes
 * POST https://api.hotelrbs.com/city/search
 * Body: { "name": "abu dhabi" }
 */
export const searchCityByName = async (cityName: string): Promise<CitySearchResult> => {
  try {
    console.log('🔍 Searching for city:', cityName);
    const response = await fetch(getDirectApiUrl('/city/search'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name: cityName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ City search response:', data);
    
    return {
      city_code: data.city_code,
      city_name: data.city_name,
      country_code: data.country_code,
      country_name: data.country_name,
    };
  } catch (error) {
    console.error('❌ Error searching city:', error);
    throw error;
  }
};
