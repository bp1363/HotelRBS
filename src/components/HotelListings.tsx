import { useState } from "react";
import { Button } from "@/components/ui/button";
import UniversalHotelCard from "@/components/UniversalHotelCard";
import { useFavorites } from "@/hooks/useFavorites";
import { hotels } from "@/data/hotels";

const HotelListings = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price');

  const toggleFavoriteLocal = (hotelId: string) => {
    toggleFavorite(hotelId);
  };

  const sortedHotels = [...hotels].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Over 300 stays in Riyadh
          </h2>
          <p className="text-gray-500 mt-1">
            Book soon. {Math.floor(Math.random() * 15) + 5} travelers are looking at this area.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={sortBy === 'price' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('price')}
            className="transition-all duration-200 hover:scale-105"
          >
            Price
          </Button>
          <Button 
            variant={sortBy === 'rating' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('rating')}
            className="transition-all duration-200 hover:scale-105"
          >
            Rating
          </Button>
          <Button 
            variant={sortBy === 'distance' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('distance')}
            className="transition-all duration-200 hover:scale-105"
          >
            Distance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sortedHotels.map((hotel, index) => (
          <UniversalHotelCard
            key={hotel.id}
            hotel={hotel}
            onFavoriteToggle={toggleFavoriteLocal}
            isFavorite={isFavorite(hotel.id)}
            animationDelay={index * 100}
          />
        ))}
      </div>

      <div className="text-center pt-8 animate-fade-in">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => {
            console.log('Loading more stays...');
            // Future implementation: Load more hotels from API
          }}
          className="hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Show more stays
        </Button>
      </div>
    </div>
  );
};

export default HotelListings;