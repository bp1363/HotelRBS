import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, MapPin, Wifi, Car, Coffee, Users, Calendar } from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  distance: string;
  availability: string;
  isNew?: boolean;
  
  checkIn?: string;
  checkOut?: string;
}

interface HotelCardProps {
  hotel: Hotel;
  onFavoriteToggle: (id: string) => void;
  isFavorite: boolean;
  animationDelay?: number;
}

const HotelCard = ({ hotel, onFavoriteToggle, isFavorite, animationDelay = 0 }: HotelCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload all images on mount
  useEffect(() => {
    const preloadImages = () => {
      hotel.images.forEach((imageUrl, index) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, index]));
        };
        img.src = imageUrl;
      });
    };
    preloadImages();
  }, [hotel.images]);

  // Preload adjacent images
  useEffect(() => {
    const preloadAdjacent = () => {
      const prevIndex = currentImageIndex === 0 ? hotel.images.length - 1 : currentImageIndex - 1;
      const nextIndex = currentImageIndex === hotel.images.length - 1 ? 0 : currentImageIndex + 1;
      
      [prevIndex, nextIndex].forEach((index) => {
        if (!loadedImages.has(index) && hotel.images[index]) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages((prev) => new Set([...prev, index]));
          };
          img.src = hotel.images[index];
        }
      });
    };
    preloadAdjacent();
  }, [currentImageIndex, hotel.images, loadedImages]);

  const handleImageNavigation = (direction: 'next' | 'prev', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const getAmenityIcon = (amenity: string) => {
    const iconProps = { className: "h-3 w-3" };
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi {...iconProps} />;
      case 'parking': return <Car {...iconProps} />;
      case 'restaurant': return <Coffee {...iconProps} />;
      case 'pool': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 11-.02-7.98 5 5 0 01.02-.02C7 8 7 8 7 8s0 0 0 0c0 0 0 0 0 0 0 0 0 0 0 0" /></svg>;
      case 'kitchen': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v-2a2 2 0 011-1.732l4-2.732a1 1 0 011.366.366L13 11l2.5-1.5a1 1 0 01.732 0L19 11a1 1 0 01.366 1.366l-2.732 4A2 2 0 0115.268 17H13v2" /></svg>;
      case 'gym': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
      case 'spa': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>;
      case 'ac': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-8 0V9a3 3 0 116 0v3M8 12l-2 2m12-2l2 2M8 12l2-2m4 2l-2-2" /></svg>;
      case 'workspace': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'bbq': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9l-5 4.74L18.18 21 12 17.27 5.82 21 7 13.74 2 9l6.91-.74L12 2z" /></svg>;
      case 'garden': return <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.3-.11.52-.4.52-.74 0-.83-.67-1.5-1.5-1.5-.83 0-1.5.67-1.5 1.5 0 .28-.22.5-.5.5-.28 0-.5-.22-.5-.5" /></svg>;
      default: return null;
    }
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 shadow-intense-3d hover:shadow-intense-3d-hover border-0 bg-white animate-fade-in-up overflow-hidden rounded-3xl hover:scale-[1.05] hover:-translate-y-2`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Crossfade container */}
          <div className="relative w-full h-full">
            {hotel.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`${hotel.name} - Image ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  index === currentImageIndex 
                    ? 'opacity-100 z-10' 
                    : 'opacity-0 z-0'
                } ${!isTransitioning ? 'group-hover:scale-105 transition-transform duration-300' : ''}`}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>

          {/* Image Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {hotel.images.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isTransitioning) return;
                  setIsTransitioning(true);
                  setCurrentImageIndex(index);
                  setTimeout(() => setIsTransitioning(false), 300);
                }}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          {isHovered && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                onClick={(e) => handleImageNavigation('prev', e)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                onClick={(e) => handleImageNavigation('next', e)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(hotel.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-all duration-200 hover:scale-110"
          >
            <Heart 
              className={`h-4 w-4 transition-all duration-300 ${
                isFavorite 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'text-white hover:text-red-300'
              }`} 
            />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {hotel.isNew && (
              <Badge className="bg-primary text-white text-xs font-medium px-2 py-1">
                New
              </Badge>
            )}
          </div>
        </div>

          <div className="p-4 space-y-3">
            {/* Location & Rating */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors duration-200">
                  {hotel.name}
                </h3>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{hotel.location}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{hotel.distance}</p>
              </div>
              
              <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium text-sm">{hotel.rating}</span>
                <span className="text-gray-500 text-sm">({hotel.reviews})</span>
              </div>
            </div>

            {/* Dates */}
            {hotel.checkIn && hotel.checkOut && (
              <p className="text-gray-500 text-sm">
                {(() => {
                  const formatDateDDMMYY = (dateStr: string) => {
                    try {
                      const date = new Date(dateStr);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = String(date.getFullYear()).slice(-2);
                      return `${day}/${month}/${year}`;
                    } catch {
                      return dateStr;
                    }
                  };
                  return `${formatDateDDMMYY(hotel.checkIn)} – ${formatDateDDMMYY(hotel.checkOut)}`;
                })()}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline space-x-1">
              {hotel.originalPrice && (
                <span className="text-gray-500 text-sm line-through">
                  ${hotel.originalPrice}
                </span>
              )}
              <span className="font-semibold text-gray-900">
                ${hotel.price}
              </span>
              <span className="text-gray-500 text-sm">night</span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1">
              {hotel.amenities.slice(0, 3).map((amenity) => (
                <div 
                  key={amenity}
                  className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full"
                >
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>

            {/* Availability Status */}
            {hotel.availability !== "Available" && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                  {hotel.availability}
                </Badge>
              </div>
            )}

          </div>
      </CardContent>
    </Card>
  );
};

export default HotelCard;