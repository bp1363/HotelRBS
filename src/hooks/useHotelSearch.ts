import { useState, useCallback } from 'react';
import { searchHotels, HotelSearchParams, HotelResult } from '../services/hotelApi';

export const useHotelSearch = () => {
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (params: HotelSearchParams): Promise<HotelResult[]> => {
      console.log('🚀 Starting hotel search with params:', params);
      setLoading(true);
      setError(null);

      try {
        
        if (!params.HotelCodes || params.HotelCodes.length === 0) {
          console.warn('⚠️ No HotelCodes provided to search');
          setHotels([]);
          setError('No hotels available for this destination.');
          return [];
        }

        const response = await searchHotels(params);

        console.log('📊 Search API response:', response);
        console.log('📊 Full response:', JSON.stringify(response, null, 2));

        const statusCode = String(response?.Status?.Code);

        if (statusCode === '200') {
          const resultHotels = Array.isArray(response.HotelResult)
            ? response.HotelResult
            : response.HotelResult
            ? [response.HotelResult]
            : [];

          console.log('✅ Hotels found:', resultHotels.length);
          setHotels(resultHotels);
          return resultHotels;
        }

        if (statusCode === '201') {
          setError('No rooms available for selected dates.');
          setHotels([]);
          return [];
        }

        if (statusCode === '204') {
          setError('No hotels found for this destination.');
          setHotels([]);
          return [];
        }

        setError(response?.Status?.Description || 'Search failed');
        setHotels([]);
        return [];
      } catch (err) {
        console.error('💥 Search error:', err);
        setError(err instanceof Error ? err.message : 'Unexpected error occurred');
        setHotels([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setHotels([]);
    setError(null);
  }, []);

  return {
    hotels,
    loading,
    error,
    search,
    clearResults,
    setHotels,
  };
};
