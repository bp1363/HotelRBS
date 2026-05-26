import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart } from "lucide-react";
import SearchModal from "@/components/SearchModal";

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  images: string[];
}

interface SimpleHotelCardProps {
  hotel: Hotel;
  onFavoriteToggle: (id: string) => void;
  isFavorite: boolean;
  animationDelay?: number;
  className?: string;
}

const SimpleHotelCard = ({ 
  hotel, 
  onFavoriteToggle, 
  isFavorite, 
  animationDelay = 0,
  className = ""
}: SimpleHotelCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle(hotel.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    setIsSearchModalOpen(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsSearchModalOpen(true);
  };

  return (
    <div
      onClick={handleCardClick}
      onTouchEnd={handleTouchEnd}
      style={{ 
        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 1
      }}
    >
      <Card 
        className={`hotel-card group cursor-pointer transition-all duration-300 shadow-intense-3d border-0 bg-white overflow-hidden rounded-2xl md:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3),0_10px_25px_rgba(0,0,0,0.2),0_5px_15px_rgba(0,0,0,0.1)] md:hover:scale-[1.05] md:hover:-translate-y-2 ${className}`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img 
              src={hotel.images[currentImageIndex]} 
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
              }}
            />

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFavoriteClick(e as any);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-all duration-200 hover:scale-110 z-10"
            >
              <Heart 
                className={`h-4 w-4 transition-all duration-300 ${
                  isFavorite 
                    ? 'fill-red-500 text-red-500 scale-110' 
                    : 'text-white hover:text-red-300'
                }`} 
              />
            </button>
          </div>

          {/* Hotel Details */}
          <div className="p-4 space-y-2">
            {/* Name & Rating */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors duration-200">
                  {hotel.name}
                </h3>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <span className="truncate">{hotel.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium text-sm">{hotel.rating}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-1">
              <span className="price font-semibold text-gray-900">
                ${hotel.price}
              </span>
              <span className="text-gray-500 text-sm">night</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        defaultDestination="Riyadh"
      />
    </div>
  );
};

export default SimpleHotelCard;