import { useState, useEffect } from "react";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    // Load favorites from localStorage on initialization
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hotelFavorites');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotelFavorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const toggleFavorite = (hotelId: string) => {
    setFavorites(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const isFavorite = (hotelId: string) => {
    return favorites.includes(hotelId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
};