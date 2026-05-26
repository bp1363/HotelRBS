// API functions for fetching hotel codes dynamically

const DIRECT_API_URL = "https://api.hotelrbs.com";

const getApiUrl = (endpoint: string) => {
  return `/api${endpoint}`;
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
    const response = await fetch(getApiUrl("/CountryList"), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🌍 Country list response:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching country list:", error);
    throw error;
  }
};

export const getCityList = async (
  countryCode: string
): Promise<CityListResponse> => {
  try {
    const response = await fetch(getApiUrl("/CityList"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ CountryCode: countryCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🏙️ City list response:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching city list:", error);
    throw error;
  }
};

// Helper functions
export const getHotelCodesString = (hotels: Hotel[]): string => {
  return hotels.map((hotel) => hotel.HotelCode).join(",");
};

export const findCountryCodeByName = (
  countries: Country[],
  countryName: string
): string | null => {
  const country = countries.find(
    c => c.Name.toLowerCase() === countryName.toLowerCase()
  );
  return country ? country.Code : null;
};

export const findCityCodeByName = (
  cities: City[],
  cityName: string
): string | null => {
  const city = cities.find(
    (c) => c.CityName.toLowerCase() === cityName.toLowerCase()
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
    console.log("🌍 Fetching all cities from custom API...");
    const response = await fetch(getDirectApiUrl("/city/all"), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ All cities response:", data);

    // Extract city names from the response array
    const cityNames = data.map((city: AllCitiesResponse) => city.city_name);
    return cityNames;
  } catch (error) {
    console.error("❌ Error fetching all cities:", error);
    throw error;
  }
};

/**
 * Search for a city by name and get its codes
 * POST https://api.hotelrbs.com/city/search
 * Body: { "name": "abu dhabi" }
 */
export const searchCityByName = async (
  cityName: string
): Promise<CitySearchResult> => {
  try {
    console.log("🔍 Searching for city:", cityName);
    const response = await fetch(getDirectApiUrl("/city/search"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name: cityName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ City search response:", data);

    return {
      city_code: data.city_code,
      city_name: data.city_name,
      country_code: data.country_code,
      country_name: data.country_name,
    };
  } catch (error) {
    console.error("❌ Error searching city:", error);
    throw error;
  }
};

export const getHotelCodeListFromPfort = async (
  countryCode: string,
  cityCode: string
): Promise<HotelCodeListResponse> => {
  try {
    console.log("🏨 Fetching hotel codes from PFORT");
    console.log("📤 Payload:", {
      CountryCode: countryCode,
      CityCode: cityCode,
    });

    const response = await fetch("/api/hotelcodelist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        CountryCode: countryCode,
        CityCode: cityCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`PFORT HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ PFORT response:", data);

    return {
      Status: {
        Code: "200",
        Message: "Success",
      },
      HotelList: data.HotelList || [],
    };
  } catch (error) {
    console.error("❌ PFORT failed:", error);
    return {
      Status: { Code: "500", Message: "PFORT request failed" },
      HotelList: [],
    };
  }
};

// DB HOTEL TYPES
export interface DBHotel {
  HotelID: string;
  HotelName: string;
  CityCode: string;
  CityName: string;
  CountryCode: string;
  CountryName: string;
  Address: string;
  PhoneNo: string;
  Latitude: string;
  Longitude: string;
  Rating: string;
  InsertedOn?: string;
}

const getDbApiUrl = (endpoint: string) => {
  return `/api/db${endpoint}`;
};

// Get all hotels from DB
export const getDbHotels = async (): Promise<DBHotel[]> => {
  try {
    const response = await fetch(getDbApiUrl("/hotels"), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`DB hotels fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("🏨 DB hotels:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching DB hotels:", error);
    throw error;
  }
};

// Get DB hotels by city code
export const getDbHotelsByCity = async (
  cityCode: string
): Promise<DBHotel[]> => {
  try {
    const response = await fetch(getDbApiUrl(`/hotels?cityCode=${cityCode}`), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`DB hotels by city failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🏙️ DB hotels for ${cityCode}:`, data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching DB hotels by city:", error);
    throw error;
  }
};

// Get DB hotel by ID
export const getDbHotelById = async (hotelId: string): Promise<DBHotel> => {
  try {
    const response = await fetch(getDbApiUrl(`/hotels/${hotelId}`), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Hotel not found");
    }

    const data = await response.json();
    console.log("🏨 DB hotel details:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching DB hotel by ID:", error);
    throw error;
  }
};

// ============================================
// SMART HOTEL SOURCE (DB → PFORT fallback)
// ============================================

export const getHotelCodeList = async (
  countryCode: string,
  cityCode: string
): Promise<HotelCodeListResponse> => {
  try {
    console.log("🧠 Trying DB hotels first...");

    const dbHotels = await getDbHotelsByCity(cityCode);

    if (dbHotels.length > 0) {
      console.log("✅ Using DB hotels");

      return {
        Status: {
          Code: "200",
          Message: "DB Hotels",
        },
        HotelList: dbHotels.map((hotel) => ({
          HotelCode: hotel.HotelID,
          HotelName: hotel.HotelName,
          CityCode: hotel.CityCode,
          CountryCode: hotel.CountryCode,
        })),
      };
    }

    console.log("⚠️ No DB hotels found → PFORT fallback");
    return await getHotelCodeListFromPfort(countryCode, cityCode);
  } catch (error) {
    console.error("❌ DB failed → PFORT fallback", error);
    return await getHotelCodeListFromPfort(countryCode, cityCode);
  }
};
