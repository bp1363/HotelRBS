import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import FakeMapView from "@/components/FakeMapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Heart,
  Share,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Users,
  Calendar,
  ArrowLeft,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Shield,
  AirVent,
  Tv,
  Bath,
  Bed,
  Shirt,
  ChevronDown,
  ChevronUp,
  Loader2,
  Phone,
  Printer,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import HotelRoomDetails from "@/components/HotelRoomDetails";
import HotelMap from "@/components/HotelMap";
import { AvailabilitySection } from "@/components/AvailabilitySection";
import { prebookHotel } from "@/services/bookingapi";
import { searchHotels, getHotelDetails } from "@/services/hotelApi";
import { APP_CONFIG, getCurrentDate, getDateFromNow } from "@/config/constants";
import { storeHotelAndRoom } from "@/services/hotelStorageApi";
import { addToWishlist, isHotelInWishlist, removeFromWishlist } from "@/services/wishlistApi";
import { useAuth } from "@/hooks/useAuth";
import { hotels as localHotels } from "@/data/hotels";
import { getCurrencySymbol, convertHotelPrices } from "@/services/currencyConverter";
import { useTranslation } from "@/contexts/TranslationContext";

const HotelDetails = () => {
  const { t, language } = useTranslation();
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  // Extract search parameters (will be redefined below)
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(false);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [hotelCoordinates, setHotelCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setIsLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedBookingCode, setSelectedBookingCode] = useState<string | null>(null);
  const [prebookLoading, setPrebookLoading] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [searchingForBookingCode, setSearchingForBookingCode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [searchingAvailability, setSearchingAvailability] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    amenities: false,
    dining: false,
    businessAmenities: false,
    rooms: false,
    attractions: false,
    location: false,
    fees: false,
    policies: false,
  });
  // console.log(HotelDetails , " details")
  console.log(id ,'id')
  
  // Extract search parameters at component level
  const checkIn = urlSearchParams.get("checkIn");
  const checkOut = urlSearchParams.get("checkOut");
  const guests = urlSearchParams.get("guests");
  const adults = parseInt(urlSearchParams.get("adults") || "2");
  const children = parseInt(urlSearchParams.get("children") || "0");
  const rooms = urlSearchParams.get("rooms");
  const childrenAgesParam = urlSearchParams.get("childrenAges");
  const roomGuestsParam = urlSearchParams.get("roomGuests");
  
  // Parse children ages
  const childrenAges = childrenAgesParam 
    ? childrenAgesParam.split(",").map(age => parseInt(age))
    : [];
  
  // Parse room guests distribution
  const roomGuests = roomGuestsParam
    ? JSON.parse(roomGuestsParam)
    : [];

  // Handler for availability changes
  const handleAvailabilityChange = async (params: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    childrenAges?: number[];
    roomGuests?: any[];
  }) => {
    console.log('🔄 Availability changed:', params);
    setSearchingAvailability(true);
    
    try {
      // Build PaxRooms structure for availability check
      let paxRooms;
      
      if (params.roomGuests && params.roomGuests.length > 0) {
        // Use detailed room guest distribution
        paxRooms = params.roomGuests.map((room: any) => ({
          Adults: room.adults || 1,
          Children: room.children || 0,
          ChildrenAges: room.childrenAges || [],
        }));
        console.log('✅ Using detailed room guest distribution:', paxRooms);
      } else {
        // Distribute guests across rooms
        const roomsCount = params.rooms;
        const adultsPerRoom = Math.floor(params.adults / roomsCount);
        const childrenPerRoom = Math.floor(params.children / roomsCount);
        
        paxRooms = Array.from({ length: roomsCount }, (_, index) => {
          const isLastRoom = index === roomsCount - 1;
          const roomAdults = isLastRoom ? params.adults - (adultsPerRoom * (roomsCount - 1)) : adultsPerRoom;
          const roomChildren = isLastRoom ? params.children - (childrenPerRoom * (roomsCount - 1)) : childrenPerRoom;
          
          const startIdx = index * childrenPerRoom;
          const endIdx = isLastRoom ? params.childrenAges?.length || 0 : startIdx + childrenPerRoom;
          const roomChildrenAges = params.childrenAges?.slice(startIdx, endIdx) || [];
          
          return {
            Adults: Math.max(1, roomAdults),
            Children: roomChildren,
            ChildrenAges: roomChildrenAges,
          };
        });
        console.log('✅ Using distributed guests across rooms:', paxRooms);
      }
      
      // Check hotel availability for new dates and guests
      console.log('🔍 Checking hotel availability for new parameters...');
      
      // Get nationality and currency from URL params
      const nationality = urlSearchParams.get("nationality") || APP_CONFIG.DEFAULT_GUEST_NATIONALITY;
      const currency = urlSearchParams.get("currency") || APP_CONFIG.DEFAULT_CURRENCY;
      
      const apiSearchParams = {
        CheckIn: params.checkIn,
        CheckOut: params.checkOut,
        HotelCodes: id,
        GuestNationality: nationality,
        PreferredCurrencyCode: currency,
        PaxRooms: paxRooms,
        IsDetailResponse: true,
        ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME
      };
      
      const searchResponse = await Promise.race([
        searchHotels(apiSearchParams),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Availability check timeout after 60 seconds')), 60000)
        )
      ]);
      console.log('🔍 Availability check response:', searchResponse);
      
      // Convert prices if response is in USD and preferred currency is different
      if (searchResponse?.HotelResult && searchResponse.HotelResult.Currency === "USD" && currency !== "USD") {
        console.log(`💱 Converting search response prices from USD to ${currency}`);
        searchResponse.HotelResult = convertHotelPrices(searchResponse.HotelResult, currency);
      }
      
      // Check if hotel is available
      if (searchResponse?.Status?.Code === '204' || searchResponse?.Status?.Code === 204) {
        console.log('❌ Hotel not available for the selected dates and guests');
        toast({
          title: "Hotel Not Available",
          description: "This hotel is not available for your selected dates and number of guests. Redirecting to search results...",
          variant: "destructive",
        });
        
        // Redirect to search results with the new parameters
        setTimeout(() => {
          const searchParams = new URLSearchParams();
          searchParams.set('checkIn', params.checkIn);
          searchParams.set('checkOut', params.checkOut);
          searchParams.set('adults', params.adults.toString());
          searchParams.set('children', params.children.toString());
          searchParams.set('rooms', params.rooms.toString());
          
          if (params.childrenAges && params.childrenAges.length > 0) {
            searchParams.set('childrenAges', params.childrenAges.join(','));
          }
          
          if (params.roomGuests && params.roomGuests.length > 0) {
            searchParams.set('roomGuests', JSON.stringify(params.roomGuests));
          }
          
          // Get the destination from the current hotel details
          if (hotelDetails) {
            searchParams.set('destination', `${hotelDetails.CityName}, ${hotelDetails.CountryName}`);
          }
          
          navigate(`/search?${searchParams.toString()}`);
          setSearchingAvailability(false);
        }, 2000);
        
        return;
      }
      
      // Check if we got valid hotel results
      if (!searchResponse?.HotelResult?.length || searchResponse.HotelResult.length === 0) {
        console.log('❌ No hotel results found for the new parameters');
        toast({
          title: "Hotel Not Available",
          description: "This hotel is not available for your selected dates and number of guests. Redirecting to search results...",
          variant: "destructive",
        });
        
        // Redirect to search results
        setTimeout(() => {
          const searchParams = new URLSearchParams();
          searchParams.set('checkIn', params.checkIn);
          searchParams.set('checkOut', params.checkOut);
          searchParams.set('adults', params.adults.toString());
          searchParams.set('children', params.children.toString());
          searchParams.set('rooms', params.rooms.toString());
          
          if (params.childrenAges && params.childrenAges.length > 0) {
            searchParams.set('childrenAges', params.childrenAges.join(','));
          }
          
          if (params.roomGuests && params.roomGuests.length > 0) {
            searchParams.set('roomGuests', JSON.stringify(params.roomGuests));
          }
          
          if (hotelDetails) {
            searchParams.set('destination', `${hotelDetails.CityName}, ${hotelDetails.CountryName}`);
          }
          
          navigate(`/search?${searchParams.toString()}`);
          setSearchingAvailability(false);
        }, 2000);
        
        return;
      }
      
      // Hotel is available - update URL and continue
      console.log('✅ Hotel is available! Updating parameters...');
      toast({
        title: "Hotel Available",
        description: "Great! This hotel is available for your selected dates.",
      });
      
      const newParams = new URLSearchParams(urlSearchParams.toString());
      newParams.set('checkIn', params.checkIn);
      newParams.set('checkOut', params.checkOut);
      newParams.set('adults', params.adults.toString());
      newParams.set('children', params.children.toString());
      newParams.set('rooms', params.rooms.toString());
      
      if (params.childrenAges && params.childrenAges.length > 0) {
        newParams.set('childrenAges', params.childrenAges.join(','));
      } else {
        newParams.delete('childrenAges');
      }
      
      // Add room guests distribution if available
      if (params.roomGuests && params.roomGuests.length > 0) {
        newParams.set('roomGuests', JSON.stringify(params.roomGuests));
      }
      
      // Navigate with new parameters - this will trigger a re-search via useEffect
      navigate(`/hotel/${id}?${newParams.toString()}`, { replace: true });
      
      // Scroll to rooms section after a brief delay
      setTimeout(() => {
        const roomsSection = document.getElementById('available-rooms-section');
        if (roomsSection) {
          roomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setSearchingAvailability(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error checking hotel availability:', error);
      toast({
        title: "Error",
        description: "Unable to check hotel availability. Please try again.",
        variant: "destructive",
      });
      setSearchingAvailability(false);
    }
  };

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showRoomDetails) {
        handleCloseRoomDetails();
        }
      }
    };

    if (showRoomDetails) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showRoomDetails]);

   const fetchHotelDetails = async (hotelCode: string) => {
    setIsLoading(true);
    try {
      // Validate hotelCode
      if (!hotelCode || hotelCode.trim() === "") {
        console.error("❌ HotelCode is empty or undefined:", hotelCode);
        throw new Error("Hotel code is required");
      }
      
      console.log("🏨 Fetching hotel details for hotelCode:", hotelCode);
      
      // Get preferred currency from URL
      const currency = urlSearchParams.get("currency") || "AED";
      
      // Get current language
      const currentLanguage = localStorage.getItem("language") || "en";
      
      const response = await getHotelDetails(hotelCode, currentLanguage);
      
      console.log("📥 Full response from getHotelDetails:", response);
      
      // Check if response has HotelDetails (might be extracted from HotelResult or HotelDetails)
      let hotelDetailsData = null;
      
      if (response?.HotelDetails) {
        hotelDetailsData = response.HotelDetails;
        console.log("✅ Using HotelDetails from response");
      } else if (response?.HotelResult) {
        // Handle if API returns HotelResult directly
        const hotelResult = response.HotelResult;
        if (Array.isArray(hotelResult) && hotelResult.length > 0) {
          hotelDetailsData = hotelResult[0];
        } else if (hotelResult && typeof hotelResult === 'object' && !Array.isArray(hotelResult)) {
          hotelDetailsData = hotelResult;
        }
        console.log("✅ Using HotelResult from response");
      }
      
      if (!hotelDetailsData) {
        console.error("❌ No hotel details in response:", response);
        console.error("❌ Response keys:", response ? Object.keys(response) : "null");
        throw new Error("Hotel details not found in API response");
      }
      
      // Additional validation
      if (!hotelDetailsData || (typeof hotelDetailsData === 'object' && !hotelDetailsData.HotelCode)) {
        console.error("❌ Invalid hotel details data:", hotelDetailsData);
        throw new Error("Invalid hotel details data received");
      }
      
      // Translate API response if language is not English
      if (currentLanguage !== "en" && hotelDetailsData) {
        const { translateHotelData } = await import("@/services/apiTranslationService");
        hotelDetailsData = await translateHotelData(hotelDetailsData, currentLanguage);
      }
      
      // Convert prices from USD to preferred currency
      if (hotelDetailsData && hotelDetailsData.Currency === "USD" && currency !== "USD") {
        console.log(`💱 Converting hotel details prices from USD to ${currency}`);
        hotelDetailsData = convertHotelPrices(hotelDetailsData, currency);
      }
      
      // Normalize Images field - check multiple possible field names
      let imagesArray: string[] = [];
      
      // Check various possible image field names
      if (hotelDetailsData.Images) {
        if (Array.isArray(hotelDetailsData.Images)) {
          imagesArray = hotelDetailsData.Images.filter((img: any) => typeof img === 'string');
        } else if (typeof hotelDetailsData.Images === 'string') {
          imagesArray = [hotelDetailsData.Images];
        } else if (typeof hotelDetailsData.Images === 'object') {
          imagesArray = Object.values(hotelDetailsData.Images).filter((img: any) => 
            typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:'))
          ) as string[];
        }
      } else if (hotelDetailsData.HotelImages) {
        if (Array.isArray(hotelDetailsData.HotelImages)) {
          imagesArray = hotelDetailsData.HotelImages.filter((img: any) => typeof img === 'string');
        } else if (typeof hotelDetailsData.HotelImages === 'string') {
          imagesArray = [hotelDetailsData.HotelImages];
        }
      } else if (hotelDetailsData.ImageList) {
        if (Array.isArray(hotelDetailsData.ImageList)) {
          imagesArray = hotelDetailsData.ImageList.filter((img: any) => typeof img === 'string');
        }
      }
      
      // Set normalized Images array
      if (imagesArray.length > 0) {
        hotelDetailsData.Images = imagesArray;
        console.log(`✅ Normalized Images array with ${imagesArray.length} images`);
      }
      
      // Ensure FrontImage is set
      if (!hotelDetailsData.FrontImage) {
        if (imagesArray.length > 0) {
          hotelDetailsData.FrontImage = imagesArray[0];
        } else if (hotelDetailsData.FrontImage) {
          // Already set, keep it
        }
      }
      
      // Normalize HotelFacilities/Amenities - check multiple possible field names
      let facilitiesArray: string[] = [];
      
      if (hotelDetailsData.HotelFacilities) {
        if (Array.isArray(hotelDetailsData.HotelFacilities)) {
          facilitiesArray = hotelDetailsData.HotelFacilities.filter((f: any) => typeof f === 'string');
        } else if (typeof hotelDetailsData.HotelFacilities === 'string') {
          facilitiesArray = hotelDetailsData.HotelFacilities.split(',').map(a => a.trim());
        }
      } else if (hotelDetailsData.Amenities) {
        if (Array.isArray(hotelDetailsData.Amenities)) {
          facilitiesArray = hotelDetailsData.Amenities.filter((f: any) => typeof f === 'string');
        } else if (typeof hotelDetailsData.Amenities === 'string') {
          facilitiesArray = hotelDetailsData.Amenities.split(',').map(a => a.trim());
        }
      } else if (hotelDetailsData.Facilities) {
        if (Array.isArray(hotelDetailsData.Facilities)) {
          facilitiesArray = hotelDetailsData.Facilities.filter((f: any) => typeof f === 'string');
        } else if (typeof hotelDetailsData.Facilities === 'string') {
          facilitiesArray = hotelDetailsData.Facilities.split(',').map(a => a.trim());
        }
      }
      
      // Extract amenities from Description if no facilities found
      if (facilitiesArray.length === 0 && hotelDetailsData.Description) {
        console.log("🔍 No facilities found, extracting from Description...");
        const description = hotelDetailsData.Description.toLowerCase();
        const commonAmenities = [
          'wifi', 'wi-fi', 'restaurant', 'bar', 'swimming pool', 'pool', 'gym', 'fitness', 
          'spa', 'parking', 'concierge', '24-h reception', 'reception', 'elevator', 
          'air conditioning', 'ac', 'tv', 'television', 'safe', 'safety box', 'bathroom',
          'shower', 'bathtub', 'telephone', 'room service', 'laundry', 'business center',
          'conference room', 'meeting room', 'breakfast', 'airport shuttle', 'shuttle'
        ];
        
        const foundAmenities: string[] = [];
        commonAmenities.forEach(amenity => {
          if (description.includes(amenity.toLowerCase())) {
            foundAmenities.push(amenity.charAt(0).toUpperCase() + amenity.slice(1));
          }
        });
        
        if (foundAmenities.length > 0) {
          facilitiesArray = foundAmenities;
          console.log(`✅ Extracted ${foundAmenities.length} amenities from Description`);
        }
      }
      
      // Set normalized HotelFacilities array
      if (facilitiesArray.length > 0) {
        hotelDetailsData.HotelFacilities = facilitiesArray;
        console.log(`✅ Normalized HotelFacilities array with ${facilitiesArray.length} facilities`);
      }
      
      // Parse Map coordinates if available (format: "lat|lng")
      if ((hotelDetailsData as any).Map) {
        try {
          const mapStr = String((hotelDetailsData as any).Map).trim();
          if (mapStr && mapStr.includes('|')) {
            const parts = mapStr.split('|').map(coord => coord.trim()).filter(coord => coord);
            if (parts.length >= 2) {
              const lat = parseFloat(parts[0]);
              const lng = parseFloat(parts[1]);
              if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                // Check if hotelCoordinates is null or doesn't have coordinates
                if (!hotelCoordinates || !hotelCoordinates.lat || !hotelCoordinates.lng || 
                    (hotelCoordinates.lat !== lat || hotelCoordinates.lng !== lng)) {
                  setHotelCoordinates({ lat, lng });
                  console.log(`✅ Parsed coordinates from Map field: ${lat}, ${lng}`);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error parsing Map coordinates:", error);
        }
      }
      
      // Also check Lattitude/Latitude and Longitude fields
      if (!hotelCoordinates || !hotelCoordinates.lat || !hotelCoordinates.lng) {
        const lat = parseFloat((hotelDetailsData as any).Lattitude || (hotelDetailsData as any).Latitude || 0);
        const lng = parseFloat((hotelDetailsData as any).Longitude || 0);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          setHotelCoordinates({ lat, lng });
          console.log(`✅ Set coordinates from Lattitude/Longitude fields: ${lat}, ${lng}`);
        }
      }
      
      // Log ALL fields for debugging
      console.log("✅ ALL Hotel Details Fields:");
      console.log("  - PhoneNumber:", (hotelDetailsData as any).PhoneNumber);
      console.log("  - FaxNumber:", (hotelDetailsData as any).FaxNumber);
      console.log("  - CheckInTime:", (hotelDetailsData as any).CheckInTime);
      console.log("  - CheckOutTime:", (hotelDetailsData as any).CheckOutTime);
      console.log("  - Map:", (hotelDetailsData as any).Map);
      console.log("  - CityId:", (hotelDetailsData as any).CityId);
      console.log("  - CountryCode:", (hotelDetailsData as any).CountryCode);
      console.log("  - Description length:", hotelDetailsData.Description?.length || 0);
      console.log("✅ Setting hotel details:", hotelDetailsData);
      console.log("✅ Images array length:", hotelDetailsData.Images?.length || 0);
      console.log("✅ HotelFacilities:", hotelDetailsData.HotelFacilities);
      console.log("✅ HotelFacilities is array:", Array.isArray(hotelDetailsData.HotelFacilities));
      console.log("✅ HotelFacilities length:", hotelDetailsData.HotelFacilities?.length || 0);
      console.log("✅ FULL hotelDetailsData object:", JSON.stringify(hotelDetailsData, null, 2));
      setHotelDetails(hotelDetailsData);
    } catch (error) {
      console.error("Error fetching hotel details from API:", error);
      // FALLBACK API COMMENTED OUT - Only using direct hotel details API
      /*
      console.log("🔄 Attempting fallback: Try using search API...");
      
      // Fallback 1: Try search API with hotel code
      try {
        const checkIn = urlSearchParams.get("checkIn");
        const checkOut = urlSearchParams.get("checkOut");
        const nationality = urlSearchParams.get("nationality") || APP_CONFIG.DEFAULT_GUEST_NATIONALITY;
        const currency = urlSearchParams.get("currency") || APP_CONFIG.DEFAULT_CURRENCY;
        const adults = parseInt(urlSearchParams.get("adults") || "2");
        const children = parseInt(urlSearchParams.get("children") || "0");
        const rooms = parseInt(urlSearchParams.get("rooms") || "1");
        
        if (checkIn && checkOut) {
          const paxRooms = [{
            Adults: adults,
            Children: children,
            ChildrenAges: childrenAges.slice(0, children)
          }];
          
          const searchParams = {
            CheckIn: checkIn,
            CheckOut: checkOut,
            HotelCodes: hotelCode,
            GuestNationality: nationality,
            PreferredCurrencyCode: currency,
            PaxRooms: paxRooms,
            IsDetailResponse: true,
            ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME
          };
          
          console.log("🔍 Trying search API as fallback...");
          console.log("🔍 Search params:", JSON.stringify(searchParams, null, 2));
          const searchResponse = await searchHotels(searchParams);
          
          console.log("🔍 Search API response:", searchResponse);
          console.log("🔍 Search response Status:", searchResponse?.Status);
          console.log("🔍 Search response HotelResult:", searchResponse?.HotelResult);
          console.log("🔍 HotelResult type:", typeof searchResponse?.HotelResult);
          console.log("🔍 HotelResult is array:", Array.isArray(searchResponse?.HotelResult));
          
          // Check if HotelResult exists and is not empty
          const hotelResult = searchResponse?.HotelResult;
          const isEmptyResult = !hotelResult || 
                               (Array.isArray(hotelResult) && hotelResult.length === 0) ||
                               (typeof hotelResult === 'object' && Object.keys(hotelResult).length === 0);
          
          if (!isEmptyResult) {
            let hotel = hotelResult;
            
            // Handle array format
            if (Array.isArray(hotel)) {
              console.log("🔍 HotelResult is array, length:", hotel.length);
              hotel = hotel.find((h: any) => h.HotelCode === hotelCode || h.HotelCode === String(hotelCode)) || hotel[0];
              console.log("🔍 Selected hotel from array:", hotel?.HotelCode, hotel?.HotelName);
            } 
            // Handle single object format
            else if (hotel && typeof hotel === 'object' && hotel.HotelCode) {
              console.log("🔍 HotelResult is single object:", hotel.HotelCode, hotel.HotelName);
              // Already the hotel object
            }
            
            if (hotel && hotel.HotelCode) {
              console.log("✅ Found hotel via search API fallback!");
              console.log("✅ Hotel Code:", hotel.HotelCode);
              console.log("✅ Hotel Name:", hotel.HotelName);
              console.log("✅ Hotel Address:", hotel.Address);
              console.log("✅ Hotel keys:", Object.keys(hotel));
              console.log("✅ Images field:", hotel.Images);
              console.log("✅ Images type:", typeof hotel.Images);
              console.log("✅ Images is array:", Array.isArray(hotel.Images));
              console.log("✅ HotelFacilities:", hotel.HotelFacilities);
              console.log("✅ Amenities:", hotel.Amenities);
              console.log("✅ Description:", hotel.Description);
              console.log("✅ Full hotel object:", JSON.stringify(hotel, null, 2));
              
              // Normalize Images - check multiple possible field names
              let imagesArray: string[] = [];
              if (hotel.Images) {
                if (Array.isArray(hotel.Images)) {
                  imagesArray = hotel.Images.filter((img: any) => typeof img === 'string');
                } else if (typeof hotel.Images === 'string') {
                  imagesArray = [hotel.Images];
                } else if (typeof hotel.Images === 'object') {
                  imagesArray = Object.values(hotel.Images).filter((img: any) => 
                    typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:'))
                  ) as string[];
                }
              } else if ((hotel as any).HotelImages) {
                const hotelImages = (hotel as any).HotelImages;
                if (Array.isArray(hotelImages)) {
                  imagesArray = hotelImages.filter((img: any) => typeof img === 'string');
                } else if (typeof hotelImages === 'string') {
                  imagesArray = [hotelImages];
                }
              } else if ((hotel as any).ImageList) {
                const imageList = (hotel as any).ImageList;
                if (Array.isArray(imageList)) {
                  imagesArray = imageList.filter((img: any) => typeof img === 'string');
                }
              }
              
              if (imagesArray.length > 0) {
                hotel.Images = imagesArray;
                console.log(`✅ Normalized Images array with ${imagesArray.length} images`);
              }
              
              // Ensure FrontImage is set
              if (!hotel.FrontImage && imagesArray.length > 0) {
                hotel.FrontImage = imagesArray[0];
              }
              
              // Normalize HotelFacilities/Amenities - check multiple possible field names
              let facilitiesArray: string[] = [];
              if (hotel.HotelFacilities) {
                if (Array.isArray(hotel.HotelFacilities)) {
                  facilitiesArray = hotel.HotelFacilities.filter((f: any) => typeof f === 'string');
                } else if (typeof hotel.HotelFacilities === 'string') {
                  facilitiesArray = hotel.HotelFacilities.split(',').map(a => a.trim());
                }
              } else if ((hotel as any).Amenities) {
                const amenities = (hotel as any).Amenities;
                if (Array.isArray(amenities)) {
                  facilitiesArray = amenities.filter((f: any) => typeof f === 'string');
                } else if (typeof amenities === 'string') {
                  facilitiesArray = amenities.split(',').map(a => a.trim());
                }
              } else if ((hotel as any).Facilities) {
                const facilities = (hotel as any).Facilities;
                if (Array.isArray(facilities)) {
                  facilitiesArray = facilities.filter((f: any) => typeof f === 'string');
                } else if (typeof facilities === 'string') {
                  facilitiesArray = facilities.split(',').map(a => a.trim());
                }
              }
              
              if (facilitiesArray.length > 0) {
                hotel.HotelFacilities = facilitiesArray;
                console.log(`✅ Normalized HotelFacilities array with ${facilitiesArray.length} facilities`);
              }
              
              // Convert prices if needed
              if (hotel.Currency === "USD" && currency !== "USD") {
                console.log(`💱 Converting prices from USD to ${currency}`);
                hotel = convertHotelPrices(hotel, currency);
              }
              
              console.log("✅ Setting hotel details from search API...");
              console.log("✅ Final Images array length:", hotel.Images?.length || 0);
              console.log("✅ HotelFacilities length:", hotel.HotelFacilities?.length || 0);
              setHotelDetails(hotel);
              
              // Set coordinates if available
              if (hotel.Lattitude && hotel.Longitude) {
                const lat = parseFloat(hotel.Lattitude);
                const lng = parseFloat(hotel.Longitude);
                console.log("✅ Setting coordinates:", { lat, lng });
                setHotelCoordinates({ lat, lng });
              } else if (hotel.Latitude && hotel.Longitude) {
                const lat = parseFloat(hotel.Latitude);
                const lng = parseFloat(hotel.Longitude);
                console.log("✅ Setting coordinates (alt format):", { lat, lng });
                setHotelCoordinates({ lat, lng });
              }
              
              setIsLoading(false);
              console.log("✅ Successfully loaded hotel from search API fallback!");
              return; // Success with search API
            } else {
              console.error("❌ Hotel found but missing HotelCode:", hotel);
            }
          } else {
            // Check if HotelResult is empty array or missing
            const hasEmptyHotelResult = !searchResponse?.HotelResult || 
                                       (Array.isArray(searchResponse.HotelResult) && searchResponse.HotelResult.length === 0);
            
            console.error("❌ Search API response missing or empty HotelResult");
            console.error("❌ Response keys:", searchResponse ? Object.keys(searchResponse) : "null");
            console.error("❌ HotelResult is empty:", hasEmptyHotelResult);
            
            // If Status is 201 (no rooms) with empty HotelResult, try searching with future dates to get hotel info
            if ((searchResponse?.Status?.Code === "201" || searchResponse?.Status?.Code === 201) && hasEmptyHotelResult) {
              console.log("⚠️ No rooms available AND empty HotelResult, trying future dates to get hotel info...");
              console.log("🔄 Attempting search with future dates to get hotel info...");
              
              try {
                // Try with dates 30 days from now (more likely to have availability)
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 30);
                const checkInFuture = futureDate.toISOString().split('T')[0];
                
                futureDate.setDate(futureDate.getDate() + 2);
                const checkOutFuture = futureDate.toISOString().split('T')[0];
                
                const futureSearchParams = {
                  CheckIn: checkInFuture,
                  CheckOut: checkOutFuture,
                  HotelCodes: hotelCode,
                  GuestNationality: nationality,
                  PreferredCurrencyCode: currency,
                  PaxRooms: [{ Adults: 1, Children: 0, ChildrenAges: [] }],
                  IsDetailResponse: true,
                  ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME
                };
                
                console.log("🔍 Trying search with future dates:", futureSearchParams);
                const futureSearchResponse = await searchHotels(futureSearchParams);
                
                console.log("🔍 Future search response:", futureSearchResponse);
                console.log("🔍 Future search HotelResult:", futureSearchResponse?.HotelResult);
                
                if (futureSearchResponse?.HotelResult) {
                  let futureHotel = futureSearchResponse.HotelResult;
                  
                  // Handle array format
                  if (Array.isArray(futureHotel)) {
                    console.log("🔍 Future HotelResult is array, length:", futureHotel.length);
                    if (futureHotel.length > 0) {
                      futureHotel = futureHotel.find((h: any) => h.HotelCode === hotelCode || h.HotelCode === String(hotelCode)) || futureHotel[0];
                    } else {
                      console.log("⚠️ Future dates search also returned empty array");
                      futureHotel = null;
                    }
                  } 
                  // Handle single object format
                  else if (futureHotel && typeof futureHotel === 'object' && futureHotel.HotelCode) {
                    console.log("🔍 Future HotelResult is single object:", futureHotel.HotelCode);
                    // Already the hotel object
                  }
                  
                  if (futureHotel && futureHotel.HotelCode) {
                    console.log("✅ Found hotel with future dates search:", futureHotel.HotelName);
                    
                    // Normalize Images field
                    if (futureHotel.Images && !Array.isArray(futureHotel.Images)) {
                      if (typeof futureHotel.Images === 'string') {
                        futureHotel.Images = [futureHotel.Images];
                      } else if (typeof futureHotel.Images === 'object' && futureHotel.Images !== null) {
                        futureHotel.Images = Object.values(futureHotel.Images).filter((img: any) => 
                          typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:'))
                        );
                      }
                    }
                    
                    // Ensure FrontImage is set
                    if (!futureHotel.FrontImage && futureHotel.Images && Array.isArray(futureHotel.Images) && futureHotel.Images.length > 0) {
                      futureHotel.FrontImage = futureHotel.Images[0];
                    }
                    
                    // Normalize HotelFacilities/Amenities
                    if (!futureHotel.HotelFacilities && futureHotel.Amenities) {
                      futureHotel.HotelFacilities = Array.isArray(futureHotel.Amenities) 
                        ? futureHotel.Amenities 
                        : typeof futureHotel.Amenities === 'string' 
                          ? futureHotel.Amenities.split(',').map(a => a.trim())
                          : [];
                    }
                    
                    // Keep all hotel info - we want to show the hotel details
                    if (futureHotel.Currency === "USD" && currency !== "USD") {
                      futureHotel = convertHotelPrices(futureHotel, currency);
                    }
                    
                    console.log("✅ Setting hotel with normalized data - Images:", futureHotel.Images?.length, "Facilities:", futureHotel.HotelFacilities?.length);
                    setHotelDetails(futureHotel);
                    
                    if (futureHotel.Lattitude && futureHotel.Longitude) {
                      setHotelCoordinates({
                        lat: parseFloat(futureHotel.Lattitude),
                        lng: parseFloat(futureHotel.Longitude)
                      });
                    } else if (futureHotel.Latitude && futureHotel.Longitude) {
                      setHotelCoordinates({
                        lat: parseFloat(futureHotel.Latitude),
                        lng: parseFloat(futureHotel.Longitude)
                      });
                    }
                    
                    setIsLoading(false);
                    return;
                  }
                }
              } catch (futureSearchError) {
                console.error("❌ Future dates search also failed:", futureSearchError);
              }
            }
          }
        } else {
          console.log("⚠️ Missing check-in or check-out dates for search API fallback");
        }
      } catch (searchError) {
        console.error("❌ Search API fallback also failed:", searchError);
      }
      
      // Fallback 2: Try local data
      console.log("🔄 Attempting to load from local data with ID:", hotelCode);
      const localHotel = localHotels.find(h => h.id === hotelCode);
      
      if (localHotel) {
        console.log("✅ Found hotel in local data:", localHotel.name);
        
        // Transform local hotel data to match API structure
        const transformedHotel = {
          HotelCode: localHotel.id,
          HotelName: localHotel.name,
          HotelRating: localHotel.rating,
          Address: localHotel.location,
          CityName: localHotel.location.split(',')[0] || localHotel.location,
          CountryName: "Saudi Arabia",
          Price: localHotel.price,
          Currency: "USD",
          FrontImage: localHotel.images[0],
          Images: localHotel.images,
          Description: `Welcome to ${localHotel.name}, a ${localHotel.rating}-star accommodation in ${localHotel.location}. Experience comfort and luxury with our premium amenities.`,
          Amenities: localHotel.amenities,
          Latitude: localHotel.coordinates?.lat || 24.7136,
          Longitude: localHotel.coordinates?.lng || 46.6753,
          // Add a flag to indicate this is local data
          _isLocalData: true
        };
        
        setHotelDetails(transformedHotel);
        
        // Set coordinates for map
        if (localHotel.coordinates) {
          setHotelCoordinates({
            lat: localHotel.coordinates.lat,
            lng: localHotel.coordinates.lng
          });
        }
      } else {
        console.error("❌ Hotel not found in local data either");
      }
      */
      // End of commented fallback code
    } finally {
      setIsLoading(false);
    }
  };



  // const fetchHotelDetails = async (hotelCode: string) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await getHotelDetails(hotelCode);
  //     setHotelDetails(response.HotelDetails);
  //   } catch (error) {
  //     console.error("Error fetching hotel details:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchBookingCode = async () => {
    console.log('🔍 fetchBookingCode called with id:', id);
    console.log('🔍 Current state - searchingForBookingCode:', searchingForBookingCode);
    
    if (!id) {
      console.log('❌ No id provided');
      return;
    }
    
    // Check if this is a local hotel (simple numeric ID or ID from local data)
    const isLocalHotel = localHotels.some(h => h.id === id);
    if (isLocalHotel) {
      console.log('ℹ️ This is a local hotel. Skipping booking code fetch.');
      setBookingCode(null);
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (searchingForBookingCode) {
      console.log('⏳ Already searching for booking code, skipping...');
      return;
    }
    
    setSearchingForBookingCode(true);
    console.log('🚀 Starting booking code fetch...');
    try {
      // Use today to tomorrow dates for availability check
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      let parsedCheckIn = checkIn;
      let parsedCheckOut = checkOut;
      
      // If no dates provided in URL, use today to tomorrow
      if (!checkIn || !checkOut) {
        parsedCheckIn = formatDate(today);
        parsedCheckOut = formatDate(tomorrow);
        console.log('📅 Using today to tomorrow dates:', parsedCheckIn, 'to', parsedCheckOut);
      } else {
        // Parse ISO dates to YYYY-MM-DD format
        console.log('📅 Raw checkIn:', checkIn);
        console.log('📅 Raw checkOut:', checkOut);
        
        if (checkIn && checkIn.includes('T')) {
          try {
            parsedCheckIn = new Date(checkIn).toISOString().split('T')[0];
            console.log('📅 Parsed checkIn:', parsedCheckIn);
          } catch (error) {
            console.error('Error parsing checkIn date:', checkIn, error);
            parsedCheckIn = formatDate(today);
          }
        }
        
        if (checkOut && checkOut.includes('T')) {
          try {
            parsedCheckOut = new Date(checkOut).toISOString().split('T')[0];
            console.log('📅 Parsed checkOut:', parsedCheckOut);
          } catch (error) {
            console.error('Error parsing checkOut date:', checkOut, error);
            parsedCheckOut = formatDate(tomorrow);
          }
        }
      }
      
      console.log('👥 Raw guests:', guests);
      console.log('🏠 Raw rooms:', rooms);
      
      // Always proceed with search since we now provide default dates
      console.log('✅ Proceeding with search using dates:', parsedCheckIn, 'to', parsedCheckOut);
      // Use rooms parameter if available, otherwise default to 1
      const roomsCount = rooms ? parseInt(rooms) : 1;
      
      console.log('🏠 roomsCount:', roomsCount);
      console.log('👥 adults:', adults);
      console.log('👶 children:', children);
      console.log('📋 roomGuests:', roomGuests);
      console.log('📋 roomGuests length:', roomGuests?.length);
      console.log('📋 roomGuests content:', JSON.stringify(roomGuests, null, 2));
      console.log('🔍 URL params - adults:', urlSearchParams.get("adults"));
      console.log('🔍 URL params - children:', urlSearchParams.get("children"));
      console.log('🔍 URL params - rooms:', urlSearchParams.get("rooms"));
      console.log('🔍 URL params - roomGuests:', urlSearchParams.get("roomGuests"));
      
      // Validate that parsing was successful
      if (isNaN(roomsCount)) {
        console.log('❌ Invalid room count');
        setBookingCode(null);
        return;
      }
      
      // Build PaxRooms structure based on room guest distribution or defaults
      let paxRooms;
      
      // Check if roomGuests has meaningful data (not just default 1 adult per room)
      const hasDetailedRoomGuests = roomGuests && roomGuests.length > 0 && 
        roomGuests.some((room: any) => room.adults > 1 || room.children > 0);
      
      if (hasDetailedRoomGuests) {
        // Use the detailed room guest distribution from search bar
        paxRooms = roomGuests.map((room: any) => ({
          Adults: room.adults || 1,
          Children: room.children || 0,
          ChildrenAges: room.childrenAges || [],
        }));
        console.log('✅ Using detailed room guest distribution:', paxRooms);
      } else {
        // Fallback: distribute guests across rooms
        const adultsPerRoom = Math.floor(adults / roomsCount);
        const childrenPerRoom = Math.floor(children / roomsCount);
        
        paxRooms = Array.from({ length: roomsCount }, (_, index) => {
          const isLastRoom = index === roomsCount - 1;
          const roomAdults = isLastRoom ? adults - (adultsPerRoom * (roomsCount - 1)) : adultsPerRoom;
          const roomChildren = isLastRoom ? children - (childrenPerRoom * (roomsCount - 1)) : childrenPerRoom;
          
          // Distribute children ages across rooms
          const startIdx = index * childrenPerRoom;
          const endIdx = isLastRoom ? childrenAges.length : startIdx + childrenPerRoom;
          const roomChildrenAges = childrenAges.slice(startIdx, endIdx);
          
          return {
            Adults: Math.max(1, roomAdults), // At least 1 adult per room
            Children: roomChildren,
            ChildrenAges: roomChildrenAges,
          };
        });
        console.log('✅ Using distributed guests across rooms:', paxRooms);
      }
      
      // Get nationality and currency from URL params
      const nationality = urlSearchParams.get("nationality") || APP_CONFIG.DEFAULT_GUEST_NATIONALITY;
      const currency = urlSearchParams.get("currency") || APP_CONFIG.DEFAULT_CURRENCY;
      
      const apiSearchParams = {
        CheckIn: parsedCheckIn,
        CheckOut: parsedCheckOut,
        HotelCodes: id,
        GuestNationality: nationality,
        PreferredCurrencyCode: currency,
        PaxRooms: paxRooms,
        IsDetailResponse: true,
        ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME
      };
      
      // Try to get booking code from hotel details first (faster)
      console.log('🚀 Trying to get booking code from hotel details...');
      try {
        const hotelDetailsResponse = await getHotelDetails(id);
          if (hotelDetailsResponse?.Rooms?.BookingCode) {
            console.log('✅ Found booking code from hotel details:', hotelDetailsResponse.Rooms.BookingCode);
            setBookingCode(hotelDetailsResponse.Rooms.BookingCode);
            return;
          }
        } catch (error) {
          console.log('⚠️ Hotel details approach failed, trying search API...');
        }
        
        // Fallback to search API
        console.log('🔍 Calling search API to get booking code...');
        const searchResponse = await Promise.race([
          searchHotels(apiSearchParams),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Search request timeout after 60 seconds')), 60000)
          )
        ]);
        
        console.log('🔍 Search response:', searchResponse);
        console.log('🔍 HotelResult:', searchResponse?.HotelResult);
        
        // Convert prices if response is in USD and preferred currency is different
        if (searchResponse?.HotelResult && currency !== "USD") {
          const hotelResult = searchResponse.HotelResult;
          if (Array.isArray(hotelResult)) {
            searchResponse.HotelResult = hotelResult.map((hotel: any) => 
              hotel.Currency === "USD" ? convertHotelPrices(hotel, currency) : hotel
            );
          } else if (hotelResult.Currency === "USD") {
            searchResponse.HotelResult = convertHotelPrices(hotelResult, currency);
          }
          console.log(`💱 Converted booking code search prices to ${currency}`);
        }
        
        // Check if hotel is available
        if (searchResponse?.Status?.Code === '204' || searchResponse?.Status?.Code === 204) {
          console.log('❌ Hotel not available for the selected dates');
          toast({
            title: "Hotel Not Available",
            description: "This hotel is not available for today to tomorrow. Please try different dates or select another hotel.",
            variant: "destructive",
          });
          setBookingCode(null);
          return;
        }
        
        if (searchResponse?.HotelResult) {
          const hotel = searchResponse.HotelResult;
          console.log('🔍 Hotel data:', hotel);
          console.log('🔍 Is array?', Array.isArray(hotel));
          
          // Handle both array and object structures
          if (Array.isArray(hotel)) {
            console.log('🔍 Array length:', hotel.length);
            const foundHotel = hotel.find(h => h.HotelCode === id);
            console.log('🔍 Found hotel:', foundHotel);
            
            if (foundHotel) {
              // Extract coordinates - API uses "Lattitude" with double 't'
              if (foundHotel.Lattitude !== undefined && foundHotel.Longitude !== undefined) {
                const lat = parseFloat(foundHotel.Lattitude);
                const lng = parseFloat(foundHotel.Longitude);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                  setHotelCoordinates({ lat, lng });
                  console.log('🗺️ Set coordinates from found hotel:', { lat, lng });
                } else {
                  console.log('⚠️ Coordinates are not valid numbers');
                }
              } else {
                console.log('⚠️ No coordinates in found hotel');
              }
              
              if (foundHotel.Rooms) {
                
                if (Array.isArray(foundHotel.Rooms) && foundHotel.Rooms.length > 0) {
                  const foundBookingCode = foundHotel.Rooms[0].BookingCode;
                  setBookingCode(foundBookingCode);
                  console.log('✅ Found booking code from search (array):', foundBookingCode);
                  return;
                } else if (foundHotel.Rooms.BookingCode) {
                  // Handle object structure where Rooms is an object
                  const foundBookingCode = foundHotel.Rooms.BookingCode;
                  setBookingCode(foundBookingCode);
                  console.log('✅ Found booking code from search (object):', foundBookingCode);
                  return;
                }
              }
            }
          } else if (hotel.HotelCode) {
            // Extract coordinates - API uses "Lattitude" with double 't'
            if (hotel.Lattitude && hotel.Longitude) {
              setHotelCoordinates({
                lat: parseFloat(hotel.Lattitude),
                lng: parseFloat(hotel.Longitude)
              });
              console.log('🗺️ Set coordinates from single hotel:', {
                lat: hotel.Lattitude,
                lng: hotel.Longitude
              });
            }
            
            // Handle object structure where Rooms is an object
            if (hotel.Rooms && (hotel.HotelCode === id || hotel.HotelCode === String(id))) {
              if (hotel.Rooms.BookingCode) {
                const foundBookingCode = hotel.Rooms.BookingCode;
                setBookingCode(foundBookingCode);
                console.log('✅ Found booking code from search (single):', foundBookingCode);
                return;
              }
            }
          } else {
            console.log('⚠️ Unknown hotel structure:', hotel);
          }
        }
        
        // If we reach here, no booking code was found
        console.log('❌ No booking code found for hotel');
        toast({
          title: "Booking Code Not Available",
          description: "Unable to get booking information for this hotel. Please try again later.",
          variant: "destructive",
        });
        setBookingCode(null);
      }
    catch (error) {
      console.error("Error fetching booking code:", error);
      // Set booking code to null if search fails
      setBookingCode(null);
    } finally {
      setSearchingForBookingCode(false);
    }
  };

  const handleViewRoomDetails = (bookingCode: string) => {
    // Don't open if booking code is not available or still being fetched
    if (!bookingCode || bookingCode === "no-booking-code" || searchingForBookingCode) {
      return;
    }
    setSelectedBookingCode(bookingCode);
    setShowRoomDetails(true);
  };

  const handleCloseRoomDetails = () => {
    setShowRoomDetails(false);
    setSelectedBookingCode(null);
  };

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    setBookingCode(room.BookingCode);
    console.log("Selected room:", room);
    // Close the room details after selection
    setShowRoomDetails(false);
  };


  const handleReserveClick = async () => {
    console.log("🔍 Debug - checkIn:", checkIn);
    console.log("🔍 Debug - checkOut:", checkOut);
    console.log("🔍 Debug - guests:", guests);
    console.log("🔍 Debug - rooms:", rooms);
    
    // 🔒 SECURITY: Check if user is logged in FIRST
    if (!isAuthenticated) {
      // Dispatch custom event to open login dialog
      const loginEvent = new CustomEvent('openLoginDialog');
      window.dispatchEvent(loginEvent);
      return;
    }
    
    // Check if a room is selected
    if (!selectedRoom) {
      toast({
        title: "Room Selection Required",
        description: "Please select a room before proceeding to reserve.",
        variant: "destructive",
      });
      return;
    }
    
    if (!bookingCode) {
      console.error("No booking code available, trying to fetch again...");
      // Try to fetch booking code again
      await fetchBookingCode();
      if (!bookingCode) {
        toast({
          title: "Booking Code Missing",
          description: "Booking code is not available. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setPrebookLoading(true);
    try {
      console.log("🔒 Starting prebook process with booking code:", bookingCode);

      const prebookResponse = await prebookHotel({
        BookingCode: bookingCode,
        PaymentMode: "Limit",
      });

      console.log("✅ Prebook successful:", prebookResponse);

      // Check if prebook was successful
      if (prebookResponse.Status && prebookResponse.Status.Code === "200") {
        // Generate booking reference ID (user is guaranteed to be logged in at this point)
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || 'null');
          if (userData && userData.customer_id) {
            console.log("🔍 Generating booking reference ID...");
            const { generateBookingReference } = await import('@/services/authApi');
            const bookingRefResult = await generateBookingReference(userData.customer_id);
            localStorage.setItem('booking_reference_id', bookingRefResult.booking_reference_id);
            console.log("✅ Booking reference ID generated:", bookingRefResult.booking_reference_id);
          } else {
            // This should never happen now, but keeping as failsafe
            console.error("❌ User data missing despite authentication check!");
            toast({
              title: "Authentication Error",
              description: "Please log out and log in again.",
              variant: "destructive",
            });
            setPrebookLoading(false);
            return;
          }
        } catch (refError) {
          console.error("⚠️ Failed to generate booking reference:", refError);
          toast({
            title: "Booking Reference Error",
            description: "Failed to generate booking reference. Please try again.",
            variant: "destructive",
          });
          setPrebookLoading(false);
          return;
        }
        
        // Store hotel and room details in custom backend before navigating
        try {
          console.log("💾 Storing hotel and room details to custom backend...");
          
          if (hotelDetails && selectedRoom) {
            await storeHotelAndRoom(hotelDetails, selectedRoom, bookingCode);
            console.log("✅ Hotel and room details stored successfully");
          } else {
            console.warn("⚠️ Missing hotel or room data for storage");
            console.warn("  - Hotel data:", hotelDetails ? 'Available' : 'MISSING');
            console.warn("  - Room data:", selectedRoom ? 'Available' : 'MISSING');
          }
        } catch (storageError) {
          console.error("❌ Failed to store hotel/room details:", storageError);
          // Don't fail the booking if storage fails, just log it
        }

        // Store the BookingCode with prebook data (prebook returns same code)
        console.log('🔑 BookingCode from selected room:', bookingCode);
        console.log('🔑 This BookingCode will be used throughout: Search → Prebook → Booking');
        
        // Convert prebook response prices from USD to preferred currency
        const currency = urlSearchParams.get("currency") || "AED";
        let convertedPrebookResponse = prebookResponse;
        
        if (prebookResponse.HotelResult && prebookResponse.HotelResult.Currency === "USD" && currency !== "USD") {
          console.log(`💱 Converting prebook response prices from USD to ${currency}`);
          convertedPrebookResponse = {
            ...prebookResponse,
            HotelResult: convertHotelPrices(prebookResponse.HotelResult, currency)
          };
        }
        
        // Add BookingCode to prebookData for easy access
        convertedPrebookResponse = {
          ...convertedPrebookResponse,
          BookingCode: bookingCode // Ensure BookingCode is at top level
        };

        // Navigate to booking page with hotel code and prebook data
        navigate(`/booking/${hotelDetails.HotelCode}`, {
          state: {
            prebookData: convertedPrebookResponse,
            bookingCode: bookingCode, // Same BookingCode from room selection
            selectedRoom: selectedRoom, // Pass the selected room with its BookingCode
            hotelDetails: hotelDetails,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            rooms: rooms,
            adults: adults,
            children: children,
            childrenAges: childrenAges,
            roomGuests: roomGuests,
          },
        });
      } else {
        // Handle prebook failure
        console.error("Prebook failed:", prebookResponse);
        alert(
          `Prebook failed: ${
            prebookResponse.Status?.Description || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("💥 Prebook error:", error);
      alert(
        `Prebook failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setPrebookLoading(false);
    }
  };


  // Check if hotel is in wishlist
  const checkWishlistStatus = async () => {
    if (!user || !user.customer_id || !id) return;
    
    setIsCheckingWishlist(true);
    try {
      const inWishlist = await isHotelInWishlist(user.customer_id, id);
      setIsFavorite(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setIsCheckingWishlist(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !user || !user.customer_id) {
      toast({
        title: "Login Required",
        description: "Please log in to add hotels to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (!hotelDetails) return;

    try {
      if (!isFavorite) {
        // Add to wishlist with current search parameters
        await addToWishlist({
          customer_id: user.customer_id,
          hotel_code: hotelDetails.HotelCode,
          hotel_name: hotelDetails.HotelName,
          hotel_rating: hotelDetails.HotelRating || 0,
          address: hotelDetails.Address,
          city: hotelDetails.CityName,
          country: hotelDetails.CountryName,
          price: hotelDetails.Price || 0,
          currency: hotelDetails.Currency || 'USD',
          image_url: hotelDetails.FrontImage || (hotelDetails.Images && hotelDetails.Images[0]) || '',
          search_params: {
            checkIn: checkIn || '',
            checkOut: checkOut || '',
            guests: guests || '',
            adults: adults.toString(),
            children: children.toString(),
            rooms: rooms || '',
            childrenAges: childrenAgesParam || '',
            roomGuests: roomGuestsParam || '',
          },
        });

        setIsFavorite(true);
        toast({
          title: "Added to Wishlist",
          description: `${hotelDetails.HotelName} has been added to your wishlist.`,
        });
      } else {
        // Remove from wishlist
        await removeFromWishlist(user.customer_id, hotelDetails.HotelCode);
        
        setIsFavorite(false);
        toast({
          title: "Removed from Wishlist",
          description: `${hotelDetails.HotelName} has been removed from your wishlist.`,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchHotelDetails(id);
      fetchBookingCode();
      checkWishlistStatus();
    }
  }, [id, urlSearchParams, user]);

  // Re-translate hotel details when language changes
  useEffect(() => {
    if (hotelDetails && !hotelDetails._isLocalData) {
      const currentLanguage = localStorage.getItem("language") || "en";
      if (currentLanguage !== "en") {
        const translateHotel = async () => {
          const { translateHotelData } = await import("@/services/apiTranslationService");
          const translated = await translateHotelData(hotelDetails, currentLanguage);
          setHotelDetails(translated);
        };
        translateHotel();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Preload hotel images when hotelDetails changes
  useEffect(() => {
    if (hotelDetails?.Images && Array.isArray(hotelDetails.Images)) {
      const preloadImages = () => {
        hotelDetails.Images.forEach((imageUrl: string, index: number) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages((prev) => new Set([...prev, index]));
          };
          img.src = imageUrl;
        });
      };
      preloadImages();
    }
  }, [hotelDetails?.Images]);

  // Preload adjacent images
  useEffect(() => {
    if (hotelDetails?.Images && Array.isArray(hotelDetails.Images)) {
      const preloadAdjacent = () => {
        const prevIndex = currentImageIndex === 0 ? hotelDetails.Images.length - 1 : currentImageIndex - 1;
        const nextIndex = currentImageIndex === hotelDetails.Images.length - 1 ? 0 : currentImageIndex + 1;
        
        [prevIndex, nextIndex].forEach((index: number) => {
          if (!loadedImages.has(index) && hotelDetails.Images[index]) {
            const img = new Image();
            img.onload = () => {
              setLoadedImages((prev) => new Set([...prev, index]));
            };
            img.src = hotelDetails.Images[index];
          }
        });
      };
      preloadAdjacent();
    }
  }, [currentImageIndex, hotelDetails?.Images, loadedImages]);

  if (loading) {
    return <Loader />;
  }

  console.log(HotelDetails , " details")

  if (!hotelDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="w-full px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Hotel Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The hotel you're looking for doesn't exist.
          </p>
          <Link to="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to decode HTML entities
  const decodeHtmlEntities = (html: string) => {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/andlt;/g, '<')
      .replace(/andgt;/g, '>')
      .replace(/andamp;/g, '&')
      .replace(/andquot;/g, '"')
      .replace(/and#39;/g, "'");
  };

  // Helper function to extract sections from description
  const extractSections = (description: string) => {
    const decoded = decodeHtmlEntities(description);
    const sections: { [key: string]: string } = {};
    
    // Extract different sections using regex
    const sectionRegex = /<b>([^<]+)<\/b><br\s*\/?>(.*?)(?=<b>|$)/gs;
    let match;
    
    while ((match = sectionRegex.exec(decoded)) !== null) {
      const sectionName = match[1].trim();
      const sectionContent = match[2].trim();
      sections[sectionName] = sectionContent;
    }
    
    return sections;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
      case "free wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "restaurant":
        return <Coffee className="h-4 w-4" />;
      case "pool":
        return <Waves className="h-4 w-4" />;
      case "gym":
        return <Dumbbell className="h-4 w-4" />;
      case "spa":
        return <Bath className="h-4 w-4" />;
      case "ac":
      case "air conditioning":
        return <AirVent className="h-4 w-4" />;
      case "kitchen":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "tv":
        return <Tv className="h-4 w-4" />;
      case "concierge":
        return <Users className="h-4 w-4" />;
      case "workspace":
        return <Bed className="h-4 w-4" />;
      case "laundry":
        return <Shirt className="h-4 w-4" />;
      case "security":
      case "24/7 support":
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-6 lg:px-8 py-8 pt-[calc(var(--header-height-default)+80px)]">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2"
            onClick={() => {
              // Preserve all search parameters when navigating back
              const searchParams = new URLSearchParams();
              if (checkIn) searchParams.set('checkIn', checkIn);
              if (checkOut) searchParams.set('checkOut', checkOut);
              if (guests) searchParams.set('guests', guests);
              if (adults) searchParams.set('adults', adults.toString());
              if (children) searchParams.set('children', children.toString());
              if (rooms) searchParams.set('rooms', rooms.toString());
              if (childrenAges && childrenAges.length > 0) {
                searchParams.set('childrenAges', childrenAges.join(','));
              }
              if (roomGuests && roomGuests.length > 0) {
                searchParams.set('roomGuests', JSON.stringify(roomGuests));
              }
              // Preserve destination if available
              const destination = urlSearchParams.get('destination');
              if (destination) {
                searchParams.set('destination', destination);
              }
              // Preserve currency and nationality
              const currency = urlSearchParams.get('currency');
              const nationality = urlSearchParams.get('nationality');
              if (currency) searchParams.set('currency', currency);
              if (nationality) searchParams.set('nationality', nationality);
              
              navigate(`/search?${searchParams.toString()}`);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t?.back || "Back"} {t?.search || "to search"}</span>
          </Button>
        </div>

        {/* Hotel Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="aspect-[4/3] relative overflow-hidden rounded-xl group">
              {/* Crossfade container */}
              <div className="relative w-full h-full">
                {hotelDetails.Images && hotelDetails.Images.length > 0 ? (
                  hotelDetails.Images.map((imageUrl: string, index: number) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${hotelDetails.HotelName} - Image ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                        index === currentImageIndex 
                          ? 'opacity-100 z-10' 
                          : 'opacity-0 z-0'
                      }`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  ))
                ) : (
                  <img
                    src={hotelDetails.FrontImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"}
                    alt={hotelDetails.HotelName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Image Navigation Arrows */}
              {hotelDetails.Images && hotelDetails.Images.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      if (isTransitioning) return;
                      setIsTransitioning(true);
                      setCurrentImageIndex((prev) => 
                        prev === 0 ? hotelDetails.Images.length - 1 : prev - 1
                      );
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => {
                      if (isTransitioning) return;
                      setIsTransitioning(true);
                      setCurrentImageIndex((prev) => 
                        prev === hotelDetails.Images.length - 1 ? 0 : prev + 1
                      );
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-800 rotate-180" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {hotelDetails.Images.length}
                  </div>
                  
                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {hotelDetails.Images.slice(0, 5).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (isTransitioning) return;
                          setIsTransitioning(true);
                          setCurrentImageIndex(index);
                          setTimeout(() => setIsTransitioning(false), 300);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                    {hotelDetails.Images.length > 5 && (
                      <span className="text-white text-xs ml-1">+{hotelDetails.Images.length - 5}</span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Grid */}
            {hotelDetails.Images && hotelDetails.Images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {hotelDetails.Images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-primary scale-105' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {/* API does not provide isNew; can skip */}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleWishlistToggle}
                    disabled={isCheckingWishlist}
                  >
                    <Heart
                      className={`h-4 w-4 transition-all ${
                        isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">
                {hotelDetails.HotelName}
              </h1>

              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-black text-black" />
                  <span className="font-medium">
                    {hotelDetails.HotelRating
                      ? hotelDetails.HotelRating
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {hotelDetails.Address}, {hotelDetails.CityName},{" "}
                    {hotelDetails.CountryName}
                  </span>
                </div>
              </div>

              {/* Key Amenities & Highlights Section - Prominent Display */}
              {hotelDetails.HotelFacilities && hotelDetails.HotelFacilities.length > 0 && (
                <div className="mt-8 space-y-6">
                  {/* Key Amenities - Most Important */}
                  <Card className="border-2 border-primary/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Star className="h-5 w-5 text-primary fill-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {t?.keyAmenities || "Key Amenities"}
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t?.keyAmenitiesDescription || "Essential features that make your stay comfortable and memorable"}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {hotelDetails.HotelFacilities.slice(0, 8).map((amenity: string, index: number) => (
                          <div
                            key={`key-amenity-${index}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                              {getAmenityIcon(amenity)}
                            </div>
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Highlighted Facilities - Premium Features */}
                  {hotelDetails.HotelFacilities.length > 8 && (
                    <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50/50 to-white">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Waves className="h-5 w-5 text-blue-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-foreground">
                            {t?.highlightedFacilities || "Highlighted Facilities"}
                          </h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t?.highlightedFacilitiesDescription || "Premium features and services that set this property apart"}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {hotelDetails.HotelFacilities.slice(8, 16).map((facility: string, index: number) => (
                            <Badge
                              key={`facility-${index}`}
                              variant="outline"
                              className="px-4 py-2 text-sm font-semibold border-blue-300 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-400 transition-all cursor-default"
                            >
                              <div className="flex items-center gap-2">
                                {getAmenityIcon(facility)}
                                <span>{facility}</span>
                              </div>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Available Rooms Section - Only show for API hotels */}
              {!hotelDetails._isLocalData && (
                <div id="available-rooms-section" className="mt-8">
                  <div className="space-y-4">
                    {/* Show selected room summary if available */}
                    {selectedRoom && !showRoomDetails && (
                      <div className="border border-primary rounded-lg p-4 bg-primary/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{selectedRoom.Name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedRoom.MealType}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {/* Refundable badge hidden as per requirements */}
                              {selectedRoom.WithTransfers === "true" && (
                                <Badge variant="outline">With Transfers</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {getCurrencySymbol(selectedRoom.Currency || hotelDetails.Currency || 'AED')} {typeof selectedRoom.TotalFare === 'number' ? selectedRoom.TotalFare.toFixed(2) : parseFloat(selectedRoom.TotalFare).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">{t?.totalPrice || "total"}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Toggle button */}
                    {!showRoomDetails && (
                      <Button 
                        onClick={() => handleViewRoomDetails(bookingCode || "no-booking-code")}
                        variant="outline"
                        className="w-96"
                        disabled={searchingForBookingCode || !bookingCode}
                      >
                        {searchingForBookingCode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading rooms...
                          </>
                        ) : !bookingCode ? (
                          "Loading rooms..."
                        ) : selectedRoom ? (
                          "Change Room Selection"
                        ) : (
                          "Available Rooms"
                        )}
                      </Button>
                    )}
                                          
                    {/* Inline room details */}
                    {showRoomDetails && selectedBookingCode && (
                      <div className="border rounded-lg bg-muted/5">
                        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-background z-10">
                          <h4 className="font-semibold text-lg">{t?.selectRoom || "Select Your Room"}</h4>
                          <Button 
                            onClick={handleCloseRoomDetails}
                            variant="ghost"
                            size="sm"
                          >
                            {t?.close || "Close"}
                          </Button>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto p-4">
                          <HotelRoomDetails 
                            bookingCode={selectedBookingCode} 
                            onClose={handleCloseRoomDetails}
                            onRoomSelect={handleRoomSelect}
                            selectedRoom={selectedRoom}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reserve Button with Couple Video */}
              <div className="flex items-center gap-6 mt-2">
                {hotelDetails._isLocalData ? (
                  <div className="w-96">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Preview Mode:</strong> This is a demo hotel from our catalog.
                      </p>
                      <p className="text-xs text-blue-600">
                        To see live availability and book real hotels, please use the search bar to find available properties.
                      </p>
                      <Link to="/search">
                        <Button 
                          size="lg" 
                          className="w-full mt-3 bg-primary hover:bg-primary/90 text-white"
                        >
                          Search Real Hotels
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="w-96 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleReserveClick}
                    disabled={prebookLoading || (isAuthenticated && (!bookingCode || searchingForBookingCode))}
                  >
                    {searchingForBookingCode ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading booking options...
                      </>
                    ) : !isAuthenticated ? (
                      "🔒 Login Required to Reserve"
                    ) : prebookLoading ? (
                      "Processing..."
                    ) : !bookingCode ? (
                      "Loading booking options..."
                    ) : (
                      t?.reserveNow || "Reserve"
                    )}
                  </Button>
                )}
                <video
                  src="/couple-vacation.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "200px", borderRadius: "8px" }}
                />
              </div>

              {!hotelDetails._isLocalData && !bookingCode && !searchingForBookingCode && (
                <div className="text-center text-sm text-red-500 mt-2">
                  <p>Booking code not available. Please try again.</p>
                  <button 
                    onClick={fetchBookingCode}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry Fetch Booking Code
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-2">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>

        {/* Availability Section - Allow users to modify search - Hidden on mobile, shown in header */}
        <div className="hidden md:block">
          <AvailabilitySection
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            children={children}
            rooms={parseInt(rooms || "1")}
            childrenAges={childrenAges}
            onSearchChange={handleAvailabilityChange}
            isLoading={searchingAvailability}
          />
        </div>

        {/* Description and Hotel Information */}
        {hotelDetails.Description && (() => {
          const sections = extractSections(hotelDetails.Description);
          const hasSections = sections['Amenities'] || sections['Dining'] || sections['Business Amenities'] || sections['Rooms'] || sections['Location'] || sections['Attractions'] || sections['Fees'] || sections['Policies'];
          return (
            <div className="space-y-6 mb-8">
              {/* Full Description if no sections or as fallback */}
              {!hasSections && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-xl">
                      About This Hotel
                    </h3>
                    <div 
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: hotelDetails.Description.replace(/\n/g, '<br />') }}
                    />
                  </CardContent>
                </Card>
              )}
              {/* About this place */}
              {(sections['Amenities'] || sections['Dining'] || sections['Business Amenities'] || sections['Rooms']) && (
                <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 text-left">
              About this place
            </h3>
                    <div className="space-y-4">
                      {sections['Amenities'] && (
                        <Collapsible
                          open={openSections.amenities}
                          onOpenChange={(open) => setOpenSections({ ...openSections, amenities: open })}
                        >
                          <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors gap-3">
                            {openSections.amenities ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                            <h4 className="font-semibold text-foreground">{t?.amenities || "Amenities"}</h4>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 px-3 pb-3">
                            <div 
                              className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: sections['Amenities'] }}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      {sections['Dining'] && (
                        <Collapsible
                          open={openSections.dining}
                          onOpenChange={(open) => setOpenSections({ ...openSections, dining: open })}
                        >
                          <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors gap-3">
                            {openSections.dining ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                            <h4 className="font-semibold text-foreground">Dining</h4>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 px-3 pb-3">
                            <div 
                              className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: sections['Dining'] }}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      {sections['Business Amenities'] && (
                        <Collapsible
                          open={openSections.businessAmenities}
                          onOpenChange={(open) => setOpenSections({ ...openSections, businessAmenities: open })}
                        >
                          <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors gap-3">
                            {openSections.businessAmenities ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                            <h4 className="font-semibold text-foreground">Business Amenities</h4>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 px-3 pb-3">
                            <div 
                              className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: sections['Business Amenities'] }}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      {sections['Rooms'] && (
                        <Collapsible
                          open={openSections.rooms}
                          onOpenChange={(open) => setOpenSections({ ...openSections, rooms: open })}
                        >
                          <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors gap-3">
                            {openSections.rooms ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                            <h4 className="font-semibold text-foreground">{t?.rooms || "Rooms"}</h4>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 px-3 pb-3">
                            <div 
                              className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: sections['Rooms'] }}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attractions */}
              {sections['Attractions'] && (
                <Card>
                  <CardContent className="p-6">
                    <Collapsible
                      open={openSections.attractions}
                      onOpenChange={(open) => setOpenSections({ ...openSections, attractions: open })}
                    >
                      <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors -mx-3 -mt-3 mb-2 gap-3">
                        {openSections.attractions ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                        <h3 className="font-semibold text-foreground">
                          Nearby Attractions
                        </h3>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div 
                          className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sections['Attractions'] }}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              {sections['Location'] && (
                <Card>
                  <CardContent className="p-6">
                    <Collapsible
                      open={openSections.location}
                      onOpenChange={(open) => setOpenSections({ ...openSections, location: open })}
                    >
                      <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors -mx-3 -mt-3 mb-2 gap-3">
                        {openSections.location ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                        <h3 className="font-semibold text-foreground">
                          Location
                        </h3>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div 
                          className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sections['Location'] }}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              )}

              {/* Check In Instructions */}
              {sections['Check In Instructions'] && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Check In Information
                    </h3>
                    <div 
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sections['Check In Instructions'] }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Fees */}
              {sections['Fees'] && (
                <Card>
                  <CardContent className="p-6">
                    <Collapsible
                      open={openSections.fees}
                      onOpenChange={(open) => setOpenSections({ ...openSections, fees: open })}
                    >
                      <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors -mx-3 -mt-3 mb-2 gap-3">
                        {openSections.fees ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                        <h3 className="font-semibold text-foreground">
                          Fees & Charges
                        </h3>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div 
                          className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sections['Fees'] }}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              )}

              {/* Policies */}
              {sections['Policies'] && (
                <Card>
                  <CardContent className="p-6">
                    <Collapsible
                      open={openSections.policies}
                      onOpenChange={(open) => setOpenSections({ ...openSections, policies: open })}
                    >
                      <CollapsibleTrigger className="flex items-center justify-start w-full hover:bg-gray-50 rounded-lg p-3 transition-colors -mx-3 -mt-3 mb-2 gap-3">
                        {openSections.policies ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                        <h3 className="font-semibold text-foreground">
                          Policies
                        </h3>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div 
                          className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sections['Policies'] }}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })()}

        {/* Comprehensive Hotel Information */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-6 text-xl">
              Hotel Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Phone Number */}
              {(hotelDetails as any).PhoneNumber && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base font-semibold text-foreground">{(hotelDetails as any).PhoneNumber}</p>
                  </div>
                </div>
              )}

              {/* Fax Number */}
              {(hotelDetails as any).FaxNumber && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Printer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fax</p>
                    <p className="text-base font-semibold text-foreground">{(hotelDetails as any).FaxNumber}</p>
                  </div>
                </div>
              )}

              {/* Check-In Time */}
              {(hotelDetails as any).CheckInTime && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Check-In</p>
                    <p className="text-base font-semibold text-foreground">{(hotelDetails as any).CheckInTime || "Contact hotel"}</p>
                  </div>
                </div>
              )}

              {/* Check-Out Time */}
              {(hotelDetails as any).CheckOutTime && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Check-Out</p>
                    <p className="text-base font-semibold text-foreground">{(hotelDetails as any).CheckOutTime || "Contact hotel"}</p>
                  </div>
                </div>
              )}

              {/* City ID */}
              {(hotelDetails as any).CityId && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City Code</p>
                    <p className="text-base font-semibold text-foreground">{(hotelDetails as any).CityId}</p>
                  </div>
                </div>
              )}

              {/* Country Code */}
              {(hotelDetails as any).CountryCode && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country Code</p>
                    <p className="text-base font-semibold text-foreground">{(hotelDetails as any).CountryCode}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Map */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Where you'll be
            </h3>
            <HotelMap
              latitude={hotelCoordinates?.lat || 0}
              longitude={hotelCoordinates?.lng || 0}
              hotelName={hotelDetails.HotelName}
              address={`${hotelDetails.Address}, ${hotelDetails.CityName}, ${hotelDetails.CountryName}`}
            />
            <div className="mt-4 flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {hotelDetails.Address}, {hotelDetails.CityName}, {hotelDetails.CountryName}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Preview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Star className="h-5 w-5 fill-black text-black" />
              <span className="text-xl font-semibold">
                {hotelDetails.HotelRating ? hotelDetails.HotelRating : "N/A"} ·
                Guest Reviews
              </span>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Guest reviews are not available through the API at this time.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This hotel has a {hotelDetails.HotelRating || "N/A"} star rating.
              </p>
            </div>
          </CardContent>
        </Card>


        
        



      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default HotelDetails;