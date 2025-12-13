import { useState, useCallback } from 'react';
import { bookHotel, BookParams, BookResponse } from '../services/bookingapi';

export const useBook = () => {
  const [bookData, setBookData] = useState<BookResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const book = useCallback(async (params: BookParams) => {
    console.log('🚀 Starting Book with params:', params);
    setLoading(true);
    setError(null);
    
    try {
      const response = await bookHotel(params);
      console.log('📊 Received Book response:', response);
      
      if (response.Status.Code === '200') {
        console.log('✅ Book successful!');
        setBookData(response);
      } else {
        console.log('❌ Book error:', response.Status.Description);
        setError(response.Status.Description || 'Book failed');
        setBookData(null);
      }
    } catch (err) {
      console.error('💥 Book error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBookData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearBook = useCallback(() => {
    setBookData(null);
    setError(null);
  }, []);

  return {
    bookData,
    loading,
    error,
    book,
    clearBook,
  };
};
