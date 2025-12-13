import { useState, useEffect, useCallback } from 'react';
import { 
  getCountryList, 
  getCityList, 
  getHotelCodeList,
  findCountryCodeByName,
  findCityCodeByName,
  Country,
  City,
  Hotel
} from '@/services/hotelCodeApi';

export interface UseDynamicHotelCodesReturn {
  // Data
  countries: Country[];
  cities: City[];
  hotels: Hotel[];
  hotelCodes: string;
  
  // Loading states
  loadingCountries: boolean;
  loadingCities: boolean;
  loadingHotels: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchCountries: () => Promise<void>;
  fetchCities: (countryCode: string) => Promise<void>;
  fetchHotels: (countryCode: string, cityCode: string) => Promise<void>;
  fetchHotelsByNames: (countryName: string, cityName: string) => Promise<void>;
  clearData: () => void;
}

export const useDynamicHotelCodes = (): UseDynamicHotelCodesReturn => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelCodes, setHotelCodes] = useState<string>('');
  
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    setError(null);
    
    try {
      const response = await getCountryList();
      if (response.CountryList && Array.isArray(response.CountryList)) {
        setCountries(response.CountryList);
        console.log('✅ Countries loaded:', response.CountryList.length);
      } else {
        throw new Error('Invalid country list response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch countries';
      setError(errorMessage);
      console.error('❌ Error fetching countries:', err);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // Fetch cities for a country
  const fetchCities = useCallback(async (countryCode: string) => {
    if (!countryCode) return;
    
    setLoadingCities(true);
    setError(null);
    
    try {
      const response = await getCityList(countryCode);
      if (response.CityList && Array.isArray(response.CityList)) {
        setCities(response.CityList);
        console.log('✅ Cities loaded for country', countryCode, ':', response.CityList.length);
      } else {
        throw new Error('Invalid city list response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cities';
      setError(errorMessage);
      console.error('❌ Error fetching cities:', err);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Fetch hotels for a country and city
  const fetchHotels = useCallback(async (countryCode: string, cityCode: string) => {
    if (!countryCode || !cityCode) return;
    
    setLoadingHotels(true);
    setError(null);
    
    try {
      const response = await getHotelCodeList(countryCode, cityCode, false);
      if (response.HotelList && Array.isArray(response.HotelList)) {
        setHotels(response.HotelList);
        
        // Create comma-separated hotel codes string
        const codes = response.HotelList.map(hotel => hotel.HotelCode).join(',');
        setHotelCodes(codes);
        
        console.log('✅ Hotels loaded for', countryCode, cityCode, ':', response.HotelList.length);
        console.log('🏨 Hotel codes:', codes);
      } else {
        throw new Error('Invalid hotel list response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hotels';
      setError(errorMessage);
      console.error('❌ Error fetching hotels:', err);
    } finally {
      setLoadingHotels(false);
    }
  }, []);

  // Fetch hotels by country and city names (helper function)
  const fetchHotelsByNames = useCallback(async (countryName: string, cityName: string) => {
    setLoadingHotels(true);
    setError(null);
    
    try {
      console.log('🔍 Finding codes for:', countryName, cityName);
      
      // Find country code
      const countryCode = await findCountryCodeByName(countryName);
      if (!countryCode) {
        throw new Error(`Country "${countryName}" not found`);
      }
      
      // Find city code
      const cityCode = await findCityCodeByName(countryCode, cityName);
      if (!cityCode) {
        throw new Error(`City "${cityName}" not found in country "${countryName}"`);
      }
      
      console.log('✅ Found codes:', { countryCode, cityCode });
      
      // Fetch hotels using the codes
      await fetchHotels(countryCode, cityCode);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hotels by names';
      setError(errorMessage);
      console.error('❌ Error fetching hotels by names:', err);
    } finally {
      setLoadingHotels(false);
    }
  }, [fetchHotels]);

  // Clear all data
  const clearData = useCallback(() => {
    setCountries([]);
    setCities([]);
    setHotels([]);
    setHotelCodes('');
    setError(null);
  }, []);

  // Auto-fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    // Data
    countries,
    cities,
    hotels,
    hotelCodes,
    
    // Loading states
    loadingCountries,
    loadingCities,
    loadingHotels,
    
    // Error states
    error,
    
    // Actions
    fetchCountries,
    fetchCities,
    fetchHotels,
    fetchHotelsByNames,
    clearData,
  };
};

