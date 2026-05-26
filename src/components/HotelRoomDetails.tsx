import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { getHotelRoomDetails } from "@/services/hotelApi";
import { useSearchParams } from "react-router-dom";
import { convertRoomPrices, getCurrencySymbol } from "@/services/currencyConverter";
import {
  Bed,
  Wifi,
  Car,
  Coffee,
  UtensilsCrossed,
  Shield,
  AirVent,
  Tv,
  Bath,
  ArrowLeft,
} from "lucide-react";

interface HotelRoomDetailsProps {
  bookingCode: string;
  onClose?: () => void;
  onRoomSelect?: (room: RoomOption) => void;
  selectedRoom?: RoomOption | null;
}

interface RoomOption {
  Name: string;
  BookingCode: string;
  Inclusion: string;
  TotalFare: string;
  TotalTax: string;
  MealType: string;
  IsRefundable: string;
  WithTransfers: string;
}

interface HotelRoomResponse {
  HotelCode: string;
  Currency: string;
  Rooms: RoomOption[];
}

interface RoomDetails {
  HotelCode: string;
  HotelName: string;
  RoomType: string;
  Price: number;
  Currency: string;
  Amenities: string[];
  Description?: string;
  CancellationPolicy?: string;
  MealType?: string;
  Refundable?: boolean;
  CheckIn?: string;
  CheckOut?: string;
  TotalFare?: string;
  TotalTax?: string;
}

// Cache for room details to avoid redundant API calls
const roomDetailsCache = new Map<string, { data: HotelRoomResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map<string, Promise<any>>();

const HotelRoomDetails: React.FC<HotelRoomDetailsProps> = ({ bookingCode, onClose, onRoomSelect, selectedRoom }) => {
  const [hotelData, setHotelData] = useState<HotelRoomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Get preferred currency from URL
  const preferredCurrency = searchParams.get("currency") || "AED";

  // Check cache first
  const getCachedData = useCallback((code: string): HotelRoomResponse | null => {
    const cached = roomDetailsCache.get(code);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  useEffect(() => {
    if (bookingCode) {
      fetchRoomDetails();
    }
    // eslint-disable-next-line
  }, [bookingCode, preferredCurrency]);

  // Non-blocking translation in background - defined first to avoid initialization error
  const translateInBackground = useCallback(async (data: HotelRoomResponse, language: string) => {
    setIsTranslating(true);
    try {
      const { translateHotelData } = await import("@/services/apiTranslationService");
      const translated = await translateHotelData(data, language);
      
      // Update cache with translated data
      roomDetailsCache.set(bookingCode!, { data: translated, timestamp: Date.now() });
      
      // Update UI with translated data
      setHotelData(translated);
    } catch (err) {
      console.error('Translation error:', err);
      // Keep original data if translation fails
    } finally {
      setIsTranslating(false);
    }
  }, [bookingCode]);

  const processRoomData = useCallback((response: any) => {
    if (response && response.HotelResult) {
      let hotelResult = response.HotelResult;
      
      // Get current language
      const currentLanguage = localStorage.getItem("language") || "en";
      
      // Convert room prices synchronously (fast operation)
      const sourceCurrency = hotelResult.Currency || "USD";
      let processedRooms = hotelResult.Rooms || [];
      let processedData = hotelResult;
      
      if (sourceCurrency === "USD" && preferredCurrency !== "USD") {
        console.log(`💱 Converting room prices from ${sourceCurrency} to ${preferredCurrency}`);
        // Convert all rooms synchronously (fast operation)
        const convertedRooms = processedRooms.map((room: any) => 
          convertRoomPrices(room, preferredCurrency)
        );
        
        processedData = {
          ...hotelResult,
          Currency: preferredCurrency,
          Rooms: convertedRooms
        };
      }
      
      // Cache the processed data immediately
      roomDetailsCache.set(bookingCode!, { data: processedData, timestamp: Date.now() });
      
      // Show data immediately (optimistic update)
      setHotelData(processedData);
      setLoading(false);
      
      // Translate in background if needed (non-blocking - doesn't delay UI)
      if (currentLanguage !== "en") {
        // Use setTimeout to defer translation and not block UI
        setTimeout(() => {
          translateInBackground(processedData, currentLanguage);
        }, 0);
      }
    } else {
      setError("No room details found");
      setLoading(false);
    }
  }, [bookingCode, preferredCurrency, translateInBackground]);

  const fetchRoomDetails = useCallback(async () => {
    if (!bookingCode) return;

    // Check cache first
    const cached = getCachedData(bookingCode);
    if (cached) {
      console.log('✅ Using cached room details');
      setHotelData(cached);
      setLoading(false);
      
      // Still check if translation is needed in background
      const currentLanguage = localStorage.getItem("language") || "en";
      if (currentLanguage !== "en") {
        translateInBackground(cached, currentLanguage);
      }
      return;
    }

    // Check if request is already pending
    if (pendingRequests.has(bookingCode)) {
      console.log('⏳ Request already pending, waiting...');
      try {
        const response = await pendingRequests.get(bookingCode);
        processRoomData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch room details");
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    
    // Create and store the request promise
    const requestPromise = getHotelRoomDetails(bookingCode);
    pendingRequests.set(bookingCode, requestPromise);

    try {
      const response = await requestPromise;
      pendingRequests.delete(bookingCode);
      processRoomData(response);
    } catch (err) {
      pendingRequests.delete(bookingCode);
      setError(
        err instanceof Error ? err.message : "Failed to fetch room details"
      );
      setLoading(false);
    }
  }, [bookingCode, preferredCurrency, getCachedData, processRoomData, translateInBackground]);

  // Helper function to check if room is refundable
  const isRoomRefundable = (room: RoomOption): boolean => {
    return room.IsRefundable === "true" || 
           room.IsRefundable === "1" || 
           room.IsRefundable === true ||
           (typeof room.IsRefundable === "string" && room.IsRefundable.toLowerCase() === "true");
  };

  // Memoize room list to avoid re-renders - Filter to show only refundable rooms
  const roomList = useMemo(() => {
    if (!hotelData?.Rooms) return [];
    // Filter to show only refundable rooms
    return hotelData.Rooms.filter(room => isRoomRefundable(room));
  }, [hotelData?.Rooms]);

  const getAmenityIcon = (amenity: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi {...iconProps} />;
      case "parking":
        return <Car {...iconProps} />;
      case "breakfast":
        return <Coffee {...iconProps} />;
      case "restaurant":
        return <UtensilsCrossed {...iconProps} />;
      case "security":
        return <Shield {...iconProps} />;
      case "ac":
        return <AirVent {...iconProps} />;
      case "tv":
        return <Tv {...iconProps} />;
      case "bathroom":
        return <Bath {...iconProps} />;
      case "bed":
        return <Bed {...iconProps} />;
      default:
        return <Bed {...iconProps} />;
    }
  };

  if (loading && !hotelData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
        <span className="mt-4 text-muted-foreground">Loading room options...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-lg mx-auto mt-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchRoomDetails} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hotelData) {
    return (
      <Card className="w-full max-w-lg mx-auto mt-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground">No room details available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if there are any refundable rooms
  const hasRefundableRooms = roomList.length > 0;

  return (
    <div className="w-full space-y-6">
        {/* Room Options List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Refundable Room Types & Meal Plans</h3>
            {isTranslating && (
              <span className="text-xs text-muted-foreground">Translating...</span>
            )}
          </div>
          {!hasRefundableRooms ? (
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <p className="text-muted-foreground mb-2">No refundable rooms available</p>
                  <p className="text-sm text-muted-foreground">
                    This hotel currently doesn't have any refundable room options for your selected dates.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {roomList.map((room, index) => {
              const isSelected = selectedRoom?.BookingCode === room.BookingCode;
              return (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => onRoomSelect?.(room)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{room.Name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{room.MealType}</p>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* All rooms shown are refundable, so always show refundable badge */}
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100">
                          ✓ Refundable
                        </Badge>
                        {room.WithTransfers === "true" && (
                          <Badge variant="outline">With Transfers</Badge>
                        )}
                        {isSelected && (
                          <Badge variant="default" className="bg-primary">Selected</Badge>
                        )}
                      </div>
                      {room.Inclusion && (
                        <p className="text-sm text-muted-foreground">{room.Inclusion}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-primary">
                        {getCurrencySymbol(hotelData.Currency)} {typeof room.TotalFare === 'number' ? room.TotalFare.toFixed(2) : parseFloat(room.TotalFare).toFixed(2)}
                      </div>
                      {room.TotalTax !== "0" && parseFloat(room.TotalTax) > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Tax: {getCurrencySymbol(hotelData.Currency)} {typeof room.TotalTax === 'number' ? room.TotalTax.toFixed(2) : parseFloat(room.TotalTax).toFixed(2)}
                        </p>
                      )}
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          variant={isSelected ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRoomSelect?.(room);
                          }}
                        >
                          {isSelected ? "Selected" : "Select Room"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">
            Found {roomList.length} refundable room option{roomList.length !== 1 ? 's' : ''} with different meal
            plans and pricing. Each room type offers various meal options (Room
            Only, Bed & Breakfast, Half Board, Full Board) with flexible
            cancellation policies.
          </p>
        </div>
    </div>
  );
};

export default HotelRoomDetails;
