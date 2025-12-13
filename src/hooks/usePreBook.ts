import { useState, useCallback } from 'react';
import { prebookHotel, PrebookParams, PrebookResponse } from '../services/bookingapi';

export const usePreBook = () => {
  const [preBookData, setPreBookData] = useState<PrebookResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preBook = useCallback(async (params: PrebookParams) => {
    console.log('🚀 Starting PreBook with params:', params);
    setLoading(true);
    setError(null);
    
    try {
      const response = await prebookHotel(params);
      console.log('📊 Received PreBook response:', response);
      
      if (response.Status.Code === '200') {
        console.log('✅ PreBook successful!');
        setPreBookData(response);
      } else {
        console.log('❌ PreBook error:', response.Status.Description);
        setError(response.Status.Description || 'PreBook failed');
        setPreBookData(null);
      }
    } catch (err) {
      console.error('💥 PreBook error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPreBookData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPreBook = useCallback(() => {
    setPreBookData(null);
    setError(null);
  }, []);

  return {
    preBookData,
    loading,
    error,
    preBook,
    clearPreBook,
  };
};
