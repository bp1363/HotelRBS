import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Hotel } from '@/data/hotels';
import { HotelResult } from '@/services/hotelApi';
import { Button } from '@/components/ui/button';
import { getCurrencySymbol } from '@/services/currencyConverter';

interface AirbnbHotelCardProps {
  hotel: Hotel | HotelResult;
  onHover?: (hotelId: string | null) => void;
  isSelected?: boolean;
  variant?: 'list' | 'map';
}

const AirbnbHotelCard = ({ hotel, onHover, isSelected, variant = 'list' }: AirbnbHotelCardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Safety check - if hotel is not an object, return null
  if (!hotel || typeof hotel !== 'object') {
    console.error('🚨 Invalid hotel data:', hotel);
    return null;
  }

  // Helper function to check if hotel is from API
  const isApiHotel = (hotel: Hotel | HotelResult): hotel is HotelResult => {
    return hotel && typeof hotel === 'object' && 'HotelCode' in hotel;
  };

  // Normalize hotel data for consistent usage
  const normalizedHotel = {
    id: isApiHotel(hotel) ? hotel.HotelCode : hotel.id,
    name: isApiHotel(hotel) ? hotel.HotelName : hotel.name,
    location: isApiHotel(hotel) ? hotel.Address : hotel.location,
    rating: isApiHotel(hotel) ? parseFloat(hotel.StarRating) : hotel.rating,
    price: isApiHotel(hotel) ? (() => {
      let price = hotel.Price;
      console.log('🔍 AirbnbHotelCard price extraction:', {
        hotelName: hotel.HotelName,
        Price: hotel.Price,
        Rooms: hotel.Rooms,
        TotalFare: (hotel.Rooms as any)?.TotalFare,
        RoomsType: typeof hotel.Rooms,
        RoomsKeys: hotel.Rooms ? Object.keys(hotel.Rooms) : 'no rooms',
        FullRoomsObject: JSON.stringify(hotel.Rooms, null, 2)
      });
      // Always prioritize TotalFare from Rooms object (this is the real price from API)
      if (hotel.Rooms && (hotel.Rooms as any).TotalFare) {
        price = (hotel.Rooms as any).TotalFare;
        console.log('✅ Using TotalFare from Rooms:', price);
      } else if (hotel.Price) {
        price = hotel.Price;
        console.log('⚠️ Using hotel.Price as fallback:', price);
      } else {
        console.log('❌ No price found - Rooms:', hotel.Rooms, 'Price:', hotel.Price);
        price = 0; // No hardcoded fallback - show 0 if no price found
      }
      const finalPrice = typeof price === 'string' ? parseFloat(price) : price;
      console.log('🔍 Final extracted price:', finalPrice);
      return finalPrice;
    })() : hotel.price,
    currency: isApiHotel(hotel) ? hotel.Currency || 'USD' : 'USD',
    images: isApiHotel(hotel) ? [hotel.FrontImage] : hotel.images,
    originalPrice: isApiHotel(hotel) ? undefined : hotel.originalPrice,
    checkIn: isApiHotel(hotel) ? undefined : hotel.checkIn,
    checkOut: isApiHotel(hotel) ? undefined : hotel.checkOut,
    isNew: isApiHotel(hotel) ? false : hotel.isNew,
  };

  const handleClick = () => {
    // Get ALL current search parameters including guest details
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const rooms = searchParams.get("rooms");
    const childrenAges = searchParams.get("childrenAges");
    const roomGuests = searchParams.get("roomGuests");
    
    // Build URL with ALL search parameters
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    if (adults) params.set("adults", adults);
    if (children) params.set("children", children);
    if (rooms) params.set("rooms", rooms);
    if (childrenAges) params.set("childrenAges", childrenAges);
    if (roomGuests) params.set("roomGuests", roomGuests);
    // Add default rooms if not present
    if (!rooms) params.set("rooms", "1");
    
    const queryString = params.toString();
    const url = `/hotel/${normalizedHotel.id}${queryString ? `?${queryString}` : ''}`;
    
    console.log("🔗 Navigating to hotel details with params:", url);
    navigate(url);
  };

  // Preload all images on mount
  useEffect(() => {
    const images = normalizedHotel.images;
    const preloadImages = () => {
      images.forEach((imageUrl, index) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, index]));
        };
        img.src = imageUrl;
      });
    };
    preloadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preload adjacent images
  useEffect(() => {
    const images = normalizedHotel.images;
    const preloadAdjacent = () => {
      const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      const nextIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
      
      [prevIndex, nextIndex].forEach((index) => {
        if (!loadedImages.has(index) && images[index]) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages((prev) => new Set([...prev, index]));
          };
          img.src = images[index];
        }
      });
    };
    preloadAdjacent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageIndex]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => 
      prev === 0 ? normalizedHotel.images.length - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => 
      prev === normalizedHotel.images.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  if (variant === 'map') {
    return (
      <div 
        className={`bg-background rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-3d hover:shadow-3d-hover hover:scale-[1.02] ${
          isSelected ? 'ring-2 ring-primary shadow-3d-hover scale-[1.02]' : ''
        }`}
        onClick={handleClick}
        onMouseEnter={() => onHover?.(normalizedHotel.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div className="flex h-20">
          <div className="relative w-20 flex-shrink-0">
            <img 
              src={normalizedHotel.images[0]} 
              alt={normalizedHotel.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={handleLike}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-start justify-between h-full">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate mb-1">{normalizedHotel.name}</h3>
                <p className="text-muted-foreground text-xs truncate">{normalizedHotel.location}</p>
              </div>
              <div className="ml-2 text-right">
                <div className="flex items-center mb-1">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  <span className="text-xs font-medium">{normalizedHotel.rating}</span>
                </div>
                <div>
                  <span className="font-semibold text-sm">
                    {getCurrencySymbol(normalizedHotel.currency)} {normalizedHotel.price.toFixed(2)}
                  </span>
                  <div className="text-xs text-muted-foreground">night</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-background rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-3d hover:shadow-3d-hover hover:scale-[1.02] animate-fade-in"
      onClick={handleClick}
      onMouseEnter={() => onHover?.(normalizedHotel.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image Carousel */}
      <div className="relative aspect-square overflow-hidden">
        {/* Crossfade container */}
        <div className="relative w-full h-full">
          {normalizedHotel.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`${normalizedHotel.name} - Image ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                index === currentImageIndex 
                  ? 'opacity-100 z-10' 
                  : 'opacity-0 z-0'
              } ${!isTransitioning ? 'group-hover:scale-105 transition-transform duration-300' : ''}`}
              style={{
                transform: index === currentImageIndex && !isTransitioning ? 'scale(1)' : 'scale(1)',
              }}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        
        {/* Navigation Buttons */}
        {normalizedHotel.images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevImage}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNextImage}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </>
        )}

        {/* Dots Indicator */}
        {normalizedHotel.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
            {normalizedHotel.images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Heart Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white"
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

        {/* Guest Favourite Badge */}
        {normalizedHotel.isNew && (
          <div className="absolute top-6 left-2 bg-white px-2 py-1 rounded-md text-xs font-medium">
            Guest favourite
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground truncate">{normalizedHotel.name}</h3>
            <p className="text-muted-foreground text-sm">{normalizedHotel.location}</p>
          </div>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 fill-current mr-1" />
            <span className="text-sm font-medium">{normalizedHotel.rating}</span>
          </div>
        </div>

        {normalizedHotel.checkIn && normalizedHotel.checkOut && (
          <div className="text-muted-foreground text-sm mb-2">
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
              return `${formatDateDDMMYY(normalizedHotel.checkIn)} – ${formatDateDDMMYY(normalizedHotel.checkOut)}`;
            })()}
          </div>
        )}

        <div className="flex items-baseline">
          <span className="font-semibold text-foreground">
            {getCurrencySymbol(normalizedHotel.currency)} {normalizedHotel.price.toFixed(2)}
          </span>
          <span className="text-muted-foreground text-sm ml-1">night</span>
          {normalizedHotel.originalPrice && (
            <span className="text-muted-foreground text-sm line-through ml-2">
              {getCurrencySymbol(normalizedHotel.currency)} {normalizedHotel.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirbnbHotelCard;