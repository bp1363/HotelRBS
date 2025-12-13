import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Map as MapIcon,
  Loader2,
  AlertCircle,
  X,
  Star,
  Sparkles,
  MapPin,
  Wallet,
  CreditCard,
} from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import AirbnbHotelCard from "@/components/AirbnbHotelCard";
import Header from "@/components/Header";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import FakeMapView from "@/components/FakeMapView";
import {
  getCountryList,
  getCityList,
  getHotelCodeList,
  searchCityByName,
  getAllCities,
} from "@/services/hotelCodeApi";
import { APP_CONFIG, getCurrentDate, getDateFromNow } from "@/config/constants";
import { convertHotelPrices, logConversion } from "@/services/currencyConverter";
import { useTranslation } from "@/contexts/TranslationContext";
import { hotels as hardcodedHotels, Hotel } from "@/data/hotels";

const SearchResults = () => {
  console.log("🚀 SearchResults component rendering...");
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const destination = searchParams.get("destination") || "Riyadh";
  const guests =
    searchParams.get("guests") || APP_CONFIG.DEFAULT_GUESTS.toString();
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");
  const rooms = parseInt(searchParams.get("rooms") || "1");
  const childrenAgesParam = searchParams.get("childrenAges");
  const roomGuestsParam = searchParams.get("roomGuests");
  const checkInRaw = searchParams.get("checkIn") || "";
  const checkOutRaw = searchParams.get("checkOut") || "";
  const category = searchParams.get("category"); // Get category from URL
  const showHardcoded = searchParams.get("showHardcoded") === "true"; // Flag to show hardcoded hotels
  
  // Get user preferences from URL parameters (defaults to AE and AED)
  const nationality = searchParams.get("nationality") || APP_CONFIG.DEFAULT_GUEST_NATIONALITY;
  const currency = searchParams.get("currency") || APP_CONFIG.DEFAULT_CURRENCY;
  
  console.log("🌍 Search preferences:", { nationality, currency });
  
  // Parse children ages - memoize to prevent unnecessary re-renders
  const childrenAges = useMemo(() => {
    return childrenAgesParam 
      ? childrenAgesParam.split(",").map(age => parseInt(age))
      : [];
  }, [childrenAgesParam]);
  
  // Parse room guests distribution - memoize to prevent unnecessary re-renders
  const roomGuests = useMemo(() => {
    try {
      return roomGuestsParam
        ? JSON.parse(roomGuestsParam)
        : [];
    } catch (e) {
      console.error("Error parsing roomGuests:", e);
      return [];
    }
  }, [roomGuestsParam]);

  // Parse ISO dates to YYYY-MM-DD format
  const parseDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const parsedDate = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD

      // Validate that the date is reasonable (not too far in the past or future)
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (date < today) {
        console.warn("Date is in the past:", parsedDate);
        return "";
      }

      if (date > oneYearFromNow) {
        console.warn("Date is too far in the future:", parsedDate);
        return "";
      }

      return parsedDate;
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return "";
    }
  };

  const checkIn = parseDate(checkInRaw);
  const checkOut = parseDate(checkOutRaw);

  // Initialize filter state from URL parameters
  const getInitialPriceRange = (): [number, number] => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice && maxPrice) {
      return [parseInt(minPrice), parseInt(maxPrice)];
    }
    return [50, 50000]; // Increased max to accommodate luxury hotels and multi-room bookings
  };

  const getInitialFilters = (): string[] => {
    const filtersParam = searchParams.get("filters");
    if (filtersParam) {
      try {
        return JSON.parse(filtersParam);
      } catch {
        return [];
      }
    }
    return [];
  };

  const [priceRange, setPriceRange] = useState<[number, number]>(getInitialPriceRange());
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(getInitialFilters());
  const [selectedHotel, setSelectedHotel] = useState<string>();
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = viewMode === "map" ? 15 : 20;

  // Use the hotel search hook
  const { hotels, loading, error, search, setHotels, setLoading, setError } = useHotelSearch();

  // Function to update URL parameters with current filter state
  const updateURLParams = (newPriceRange?: [number, number], newFilters?: string[]) => {
    const currentPriceRange = newPriceRange || priceRange;
    const currentFilters = newFilters || selectedFilters;
    
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Update price range parameters
    newSearchParams.set("minPrice", currentPriceRange[0].toString());
    newSearchParams.set("maxPrice", currentPriceRange[1].toString());
    
    // Update filters parameter
    if (currentFilters.length > 0) {
      newSearchParams.set("filters", JSON.stringify(currentFilters));
    } else {
      newSearchParams.delete("filters");
    }
    
    // Update URL without triggering a page reload
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  // Enhanced setPriceRange that updates URL
  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    updateURLParams(newRange);
  };

  // Enhanced setSelectedFilters that updates URL
  const handleFiltersChange = (newFilters: string[]) => {
    setSelectedFilters(newFilters);
    updateURLParams(undefined, newFilters);
  };

  // Local loading state for the dynamic search process
  const [isSearching, setIsSearching] = useState(false);
  
  // Ref to track search state and prevent duplicate API calls
  const searchInProgressRef = useRef(false);
  const lastSearchParamsRef = useRef<string>("");
  const hasSearchedRef = useRef(false);
  
  // SessionStorage key for caching search results
  const SEARCH_CACHE_KEY = 'hotel_search_cache';

  // Debug logging
  console.log("📊 SearchResults state:", {
    destination,
    guests,
    adults,
    children,
    rooms,
    childrenAges,
    roomGuests,
    checkInRaw,
    checkOutRaw,
    checkIn,
    checkOut,
    hotels: hotels,
    hotelsType: typeof hotels,
    hotelsIsArray: Array.isArray(hotels),
    hotelsLength: hotels?.length,
    loading,
    error,
  });

  // Additional debugging for hotels
  if (hotels && hotels.length > 0) {
    console.log("🏨 Hotels found in state:", hotels);
    console.log("🏨 First hotel:", hotels[0]);
  } else {
    console.log("❌ No hotels in state");
  }

  // Additional debugging
  console.log("🔍 Search function available:", typeof search);

  // Create a stable search key to prevent unnecessary re-renders
  const searchKey = useMemo(() => {
    if (!checkIn || !checkOut || !destination || !guests) return "";
    return `${checkIn}-${checkOut}-${destination}-${guests}-${nationality}-${currency}-${rooms}-${adults}-${children}-${JSON.stringify(roomGuests)}`;
  }, [checkIn, checkOut, destination, guests, nationality, currency, rooms, adults, children, roomGuests]);

  // Convert hardcoded hotel to API format
  const convertHardcodedHotelToApiFormat = (hotel: Hotel): any => {
    return {
      HotelCode: hotel.id,
      HotelName: hotel.name,
      Address: hotel.location,
      StarRating: hotel.rating.toString(),
      FrontImage: hotel.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      Price: hotel.price,
      Currency: currency || "USD",
      Rooms: {
        TotalFare: hotel.price,
      },
      HotelImages: hotel.images,
      Rating: hotel.rating,
      // Add category for filtering
      Category: hotel.category,
    };
  };

  // Show hardcoded hotels by category or destination (no API call)
  useEffect(() => {
    if (category) {
      console.log("🏷️ Category filter detected:", category);
      const filteredHotels = hardcodedHotels
        .filter(hotel => hotel.category === category)
        .map(convertHardcodedHotelToApiFormat);
      
      console.log(`✅ Showing ${filteredHotels.length} hotels for category: ${category}`);
      setHotels(filteredHotels);
      setLoading(false);
      setError(null);
      setIsSearching(false);
      searchInProgressRef.current = false;
      hasSearchedRef.current = true;
      return;
    }

    // Show hardcoded hotels for destination (when showHardcoded flag is set)
    if (showHardcoded && destination) {
      console.log("📍 Destination filter detected (hardcoded):", destination);
      
      // Normalize destination name for comparison
      const destinationLower = destination.toLowerCase().trim();
      
      // Map common city names to check in hotel locations
      // Since all our hotels are in Riyadh, we check for Riyadh-related locations
      const cityMappings: { [key: string]: string[] } = {
        "riyadh": ["riyadh", "king fahd", "olaya", "al malaz", "kingdom centre", "al nakheel", "al sahafa", "diriyah", "al muhammadiyah"],
        "dubai": ["dubai"],
        "maldives": ["maldives"],
        "paris": ["paris"],
        "tokyo": ["tokyo"],
        "doha": ["doha"],
        "abu dhabi": ["abu dhabi", "abu"],
      };
      
      // Get the cities to check for this destination
      const citiesToCheck = cityMappings[destinationLower] || [destinationLower];
      
      // Filter hotels strictly by city name - only show hotels that match
      const filteredHotels = hardcodedHotels
        .filter(hotel => {
          const locationLower = hotel.location.toLowerCase();
          // Check if location contains any of the mapped city names
          return citiesToCheck.some(city => locationLower.includes(city));
        })
        .map(convertHardcodedHotelToApiFormat);
      
      // Show only matching hotels (no fallback to all hotels)
      console.log(`✅ Showing ${filteredHotels.length} hotels for destination: ${destination}`);
      setHotels(filteredHotels);
      setLoading(false);
      setError(null);
      setIsSearching(false);
      searchInProgressRef.current = false;
      hasSearchedRef.current = true;
      return;
    }
  }, [category, showHardcoded, destination, currency, setHotels]);

  // Restore cached search results on mount or when returning to page
  useEffect(() => {
    // Skip cache restoration if category or showHardcoded is present (we handle it above)
    if (category || showHardcoded) {
      return;
    }
    
    if (!checkIn || !checkOut || !destination || !guests || !searchKey) {
      return;
    }
    
    try {
      const cachedData = sessionStorage.getItem(SEARCH_CACHE_KEY);
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        // Check if cached data matches current search parameters
        if (cache.searchKey === searchKey && cache.hotels && cache.hotels.length > 0) {
          console.log("💾 Restoring cached search results -", cache.hotels.length, "hotels");
          // Restore hotels immediately
          setHotels(cache.hotels);
          // Set all loading states to false to prevent loading spinner
          setLoading(false);
          setError(null);
          setIsSearching(false);
          searchInProgressRef.current = false;
          // Mark that we've already searched with these params to prevent duplicate search
          lastSearchParamsRef.current = searchKey;
          hasSearchedRef.current = true;
          console.log("✅ Cached results restored, no loading state");
          return;
        } else {
          console.log("💾 Cached data doesn't match current search or is empty, will perform new search");
          // Clear old cache if search params don't match
          sessionStorage.removeItem(SEARCH_CACHE_KEY);
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to restore cached search results:", error);
      sessionStorage.removeItem(SEARCH_CACHE_KEY);
    }
  }, [searchKey, checkIn, checkOut, destination, guests, setHotels, category]);

  // Dynamic search based on destination
  useEffect(() => {
    // Skip API search if category or showHardcoded is present (we show hardcoded hotels instead)
    if (category || showHardcoded) {
      console.log("⏸️ Category/hardcoded filter active, skipping API search");
      return;
    }

    // Early return if no valid search parameters
    if (!checkIn || !checkOut || !destination || !guests || !searchKey) {
      console.log("ℹ️ No valid search parameters provided");
      searchInProgressRef.current = false;
      setIsSearching(false);
      setLoading(false);
      return;
    }

    // Check if we have cached results - if so, skip search
    try {
      const cachedData = sessionStorage.getItem(SEARCH_CACHE_KEY);
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        if (cache.searchKey === searchKey && cache.hotels && cache.hotels.length > 0) {
          console.log("⏸️ Cached results already restored, skipping search");
          return;
        }
      }
    } catch (error) {
      // Continue with search if cache check fails
    }

    console.log("🚨 SEARCHRESULTS USEEFFECT TRIGGERED!");
    console.log("🔍 SearchResults useEffect triggered with:", {
      checkIn,
      checkOut,
      destination,
      guests,
      nationality,
      currency,
      rooms,
      adults,
      children,
      searchKey,
    });
      
    // Prevent searching with the same parameters - prevent infinite loops
    if (lastSearchParamsRef.current === searchKey) {
      console.log("⏸️ Same search parameters detected, skipping duplicate search...");
      return;
    }
    
    // If parameters changed while a search was in progress, allow the new search
    // (This will effectively cancel the old search)
    if (searchInProgressRef.current && lastSearchParamsRef.current !== searchKey) {
      console.log("🔄 Search parameters changed, starting new search...");
      // Allow the new search to proceed
    } else if (searchInProgressRef.current) {
      console.log("⏸️ Search already in progress with same parameters, skipping...");
      return;
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 6); // 6 months from now

    const stayDuration = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if dates are in the past
    if (checkInDate < today) {
      console.warn("Check-in date is in the past:", checkIn);
      console.error("Check-in date cannot be in the past. Please select a future date.");
      setIsSearching(false);
      return;
    }

    // Check if dates are too far in the future (more than 6 months)
    if (checkInDate > maxFutureDate) {
      console.warn("Check-in date is too far in the future:", checkIn);
      console.error("Check-in date cannot be more than 6 months in the future. Please select a closer date.");
      setIsSearching(false);
      return;
    }

    if (stayDuration > 30) {
      console.warn(
        "Stay duration too long:",
        stayDuration,
        "days. Maximum allowed is 30 days."
      );
      console.error("Stay duration cannot exceed 30 days. Please select a shorter period.");
      setIsSearching(false);
      return;
    }

    if (stayDuration <= 0) {
      console.warn(
        "Invalid stay duration:",
        stayDuration,
        "days. Check-out must be after check-in."
      );
      console.error("Check-out date must be after check-in date.");
      setIsSearching(false);
      return;
    }

    console.log("✅ All parameters valid, starting search...");
    console.log("📅 Stay duration:", stayDuration, "days");

    // No hardcoded city codes - everything will be fetched dynamically from API

    // NEW FLOW: City → City Codes (city_code + country_code) → Hotel Codes → Search
    const performSearch = async () => {
        console.log("🔍 Starting NEW city-first search for:", destination);
        searchInProgressRef.current = true;
        lastSearchParamsRef.current = searchKey;
        setIsSearching(true);

        try {
          // Step 1: Search city by name to get city_code and country_code
          console.log("🏙️ Step 1: Searching for city...");
          const cityName = destination.split(",")[0]?.trim();
          
          let citySearchResult;
          try {
            citySearchResult = await searchCityByName(cityName);
            console.log("✅ Step 1 complete - City found:");
            console.log("   City:", citySearchResult.city_name);
            console.log("   City Code:", citySearchResult.city_code);
            console.log("   Country:", citySearchResult.country_name);
            console.log("   Country Code:", citySearchResult.country_code);
          } catch (error) {
            console.log("❌ City not found via custom API:", cityName);
            console.error("❌ City search error:", error);
            searchInProgressRef.current = false;
            setIsSearching(false);
            return;
          }

          const cityCode = citySearchResult.city_code;
          const countryCode = citySearchResult.country_code;

          // Step 2: Get hotel codes using the city_code and country_code
          console.log("🏨 Step 2: Getting hotel codes...");
          const hotelResponse = await getHotelCodeList(
            countryCode,
            cityCode,
            false
          );

          if (
            !hotelResponse.HotelList ||
            hotelResponse.HotelList.length === 0
          ) {
            console.log("❌ No hotels found for:", citySearchResult.city_name);
            searchInProgressRef.current = false;
            setIsSearching(false);
            return;
          }

          // Filter hotels to only include those from the specific city
          const cityHotels = hotelResponse.HotelList.filter(
            (hotel) => hotel.CityCode === cityCode
          );

          if (cityHotels.length === 0) {
            console.log(
              "❌ No hotels found for city:",
              citySearchResult.city_name,
              "with city code:",
              cityCode
            );
            searchInProgressRef.current = false;
            setIsSearching(false);
            return;
          }

          // Use all hotel codes from the filtered city hotels (no limit)
          const hotelCodes = cityHotels
            .map((hotel) => hotel.HotelCode)
            .join(",");
          console.log(
            "✅ Step 2 complete - Found",
            cityHotels.length,
            "hotels for",
            citySearchResult.city_name,
            "using all hotel codes"
          );

          // Step 3: Search hotels
          console.log("🔍 Step 3: Searching hotels...");

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
            console.log("✅ Using detailed room guest distribution:", paxRooms);
          } else {
            // Fallback: distribute guests across rooms
            const adultsPerRoom = Math.floor(adults / rooms);
            const childrenPerRoom = Math.floor(children / rooms);
            
            paxRooms = Array.from({ length: rooms }, (_, index) => {
              const isLastRoom = index === rooms - 1;
              const roomAdults = isLastRoom ? adults - (adultsPerRoom * (rooms - 1)) : adultsPerRoom;
              const roomChildren = isLastRoom ? children - (childrenPerRoom * (rooms - 1)) : childrenPerRoom;
              
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
            console.log("✅ Using distributed guests across rooms:", paxRooms);
          }
          
          let searchParams = {
            CheckIn: checkIn,
            CheckOut: checkOut,
            CityCode: cityCode, // Use city code instead of specific hotel codes
            HotelCodes: hotelCodes, // Fallback to specific hotel codes
            GuestNationality: nationality, // Use user-selected nationality
            PreferredCurrencyCode: currency, // Use user-selected currency
            PaxRooms: paxRooms,
            IsDetailResponse: true,
            ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME,
          };
          
          console.log("🔍 Searching with preferences:", { 
            nationality: searchParams.GuestNationality, 
            currency: searchParams.PreferredCurrencyCode 
          });

          console.log(
            "🔍 Trying city-based search first with cityCode:",
            cityCode
          );

          const searchResult = await search(searchParams);
          console.log("🔍 City-based search result:", searchResult);
          console.log("🔍 Search result type:", typeof searchResult);
          console.log("🔍 Search result is array:", Array.isArray(searchResult));
          console.log("🔍 Search result length:", searchResult?.length);
          console.log("🔍 Full search result JSON:", JSON.stringify(searchResult, null, 2));
          
          if (!searchResult || searchResult.length === 0) {
            console.log("⚠️ No hotels returned from search");
            setHotels([]);
            searchInProgressRef.current = false;
            setIsSearching(false);
            // Keep lastSearchParamsRef to prevent infinite retry loops
            return;
          }
          
          // Translate API responses if language is not English
          let processedHotels = searchResult;
          const currentLanguage = localStorage.getItem("language") || "en";
          if (currentLanguage !== "en") {
            console.log(`🌐 Translating hotel data to ${currentLanguage}`);
            const { translateHotelArray } = await import("@/services/apiTranslationService");
            processedHotels = await translateHotelArray(searchResult, currentLanguage);
          }
          
          // Convert prices from USD to selected currency
          let finalHotels;
          if (currency !== 'USD') {
            console.log(`💱 Converting hotel prices from USD to ${currency}`);
            const convertedHotels = processedHotels.map(hotel => {
              const converted = convertHotelPrices(hotel, currency);
              if (hotel.Price) {
                logConversion(parseFloat(hotel.Price.toString()), currency);
              }
              return converted;
            });
            finalHotels = convertedHotels;
            setHotels(convertedHotels);
            console.log("✅ Prices converted to", currency);
          } else {
            // Currency is USD, use hotels directly
            console.log("✅ Using hotels directly (USD)");
            finalHotels = processedHotels;
            setHotels(processedHotels);
          }
          
          // Store search results in sessionStorage for navigation back
          try {
            const cacheData = {
              searchKey,
              hotels: finalHotels,
              timestamp: Date.now(),
              searchParams: {
                checkIn,
                checkOut,
                destination,
                guests,
                nationality,
                currency,
                rooms,
                adults,
                children,
                roomGuests,
              }
            };
            sessionStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cacheData));
            console.log("💾 Search results cached to sessionStorage");
          } catch (error) {
            console.warn("⚠️ Failed to cache search results:", error);
          }
          
          // Reset loading state now that hotels are loaded
          searchInProgressRef.current = false;
          setIsSearching(false);
          
          console.log("✅ Step 3 complete - Search finished");
          console.log("🔍 Final search result:", searchResult);
          console.log("🔍 Hotels state after search:", hotels);

          // Force a small delay to ensure state updates
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Debug: Log the first hotel's room structure to understand pricing
          if (hotels && hotels.length > 0) {
            console.log(
              "🔍 Debug - First hotel rooms structure:",
              hotels[0].Rooms
            );
            if (hotels[0].Rooms && hotels[0].Rooms.length > 0) {
              console.log("🔍 Debug - First room details:", hotels[0].Rooms[0]);
            }
          }
        } catch (error) {
          console.error("❌ Search failed:", error);
          searchInProgressRef.current = false;
          setIsSearching(false);
        }

        // Safety timeout to ensure isSearching gets reset
        setTimeout(() => {
          searchInProgressRef.current = false;
          setIsSearching(false);
        }, 10000);
      };

    // Call async function (fire and forget)
    performSearch().catch((error) => {
      console.error("❌ Error in hotel search:", error);
      searchInProgressRef.current = false;
      setIsSearching(false);
    });
  }, [searchKey, search]);

  // Enhanced filtering logic with proper categorization
  const filteredHotels = useMemo(() => {
    console.log("🔍 Filtering hotels...");
    console.log("🏨 Input hotels:", hotels);
    console.log("🏨 Hotels length:", hotels?.length);
    console.log("🔍 Selected filters:", selectedFilters);
    console.log("🔍 Price range:", priceRange);

    if (!hotels || !Array.isArray(hotels)) {
      console.log("❌ Hotels is not an array:", hotels);
      return [];
    }

    let priceFilteredOut = 0;
    let typeFilteredOut = 0;
    let amenityFilteredOut = 0;
    let cancellationFilteredOut = 0;
    let starFilteredOut = 0;
    let categoryFilteredOut = 0;

    // Log first 3 hotels completely to understand structure
    if (hotels.length > 0) {
      console.log("🔍 DETAILED HOTEL INSPECTION (First 3 hotels):");
      hotels.slice(0, 3).forEach((hotel, idx) => {
        console.log(`\n--- Hotel ${idx + 1}: ${hotel.HotelName} ---`);
        console.log("Full hotel object:", JSON.stringify(hotel, null, 2));
      });
    }

    let filtered = hotels.filter((hotel, hotelIndex) => {
      const isFirstHotel = hotelIndex === 0;
      
      if (isFirstHotel) {
        console.log("\n🔍 FILTERING FIRST HOTEL:", hotel.HotelName);
      }

      // Extract price from API response - Rooms is an object with TotalFare
      let price = hotel.Price;

      // Always prioritize TotalFare from Rooms object (this is the real price from API)
      if (hotel.Rooms && (hotel.Rooms as any).TotalFare) {
        price = (hotel.Rooms as any).TotalFare;
        if (isFirstHotel) console.log("  ✅ Using TotalFare from Rooms:", price);
      } else if (hotel.Price) {
        price = hotel.Price;
        if (isFirstHotel) console.log("  ⚠️ Using hotel.Price as fallback:", price);
      } else {
        if (isFirstHotel) console.log("  ❌ No price found");
        price = 0;
      }
      
      // Convert string to number if needed
      price = typeof price === "string" ? parseFloat(price) : price;
      
      // Handle NaN or invalid prices
      if (isNaN(price) || price === null || price === undefined) {
        price = 0;
      }

      if (isFirstHotel) {
        console.log("  💰 Final price:", price);
        console.log("  📏 Price range:", priceRange);
        console.log("  🏷️ Selected filters:", selectedFilters);
      }
      
      // Price range filter - Only filter if hotel has a valid price
      // Hotels without price data should still be shown
      if (price > 0) {
        const priceMatch = price >= priceRange[0] && price <= priceRange[1];
        if (!priceMatch) {
          priceFilteredOut++;
          if (isFirstHotel) {
            console.log(`  ❌ REJECTED by price filter: ${price} not in [${priceRange[0]}, ${priceRange[1]}]`);
          }
          return false;
        } else if (isFirstHotel) {
          console.log(`  ✅ PASSED price filter: ${price} in [${priceRange[0]}, ${priceRange[1]}]`);
        }
      } else if (isFirstHotel) {
        console.log(`  ⚠️ No price, skipping price filter`);
      }

      // Star rating filtering (3*, 4*, 5*)
      const starRatingFilters = selectedFilters.filter(filter => 
        ['star-3', 'star-4', 'star-5'].includes(filter)
      );
      
      if (starRatingFilters.length > 0) {
        if (isFirstHotel) console.log(`  ⭐ Checking star rating filters:`, starRatingFilters);
        
        const rating = hotel.StarRating || hotel.Rating || hotel.rating || 0;
        const numericRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
        const floorRating = Math.floor(numericRating);
        
        const starMatch = starRatingFilters.some(filter => {
          const stars = parseInt(filter.split('-')[1]);
          return floorRating === stars;
        });
        
        if (!starMatch) {
          starFilteredOut++;
          if (isFirstHotel) {
            console.log(`  ❌ REJECTED by star rating filter: ${floorRating} stars doesn't match ${starRatingFilters.join(', ')}`);
          }
          return false;
        } else if (isFirstHotel) {
          console.log(`  ✅ PASSED star rating filter`);
        }
      } else if (isFirstHotel) {
        console.log(`  ⚠️ No star rating filters active`);
      }

      // Category filtering (Standard, Deluxe, Luxury)
      const categoryFilters = selectedFilters.filter(filter => 
        ['standard', 'deluxe', 'luxury'].includes(filter)
      );
      
      if (categoryFilters.length > 0) {
        if (isFirstHotel) console.log(`  🏷️ Checking category filters:`, categoryFilters);
        
        const rating = hotel.StarRating || hotel.Rating || hotel.rating || 0;
        const numericRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
        const hotelName = hotel.HotelName?.toLowerCase() || '';
        
        const categoryMatch = categoryFilters.some(category => {
          switch (category) {
            case 'standard':
              return numericRating <= 3 || 
                     hotelName.includes('standard') || 
                     hotelName.includes('budget') || 
                     hotelName.includes('economy');
            case 'deluxe':
              return numericRating === 4 || 
                     hotelName.includes('deluxe') || 
                     hotelName.includes('premium') || 
                     hotelName.includes('superior');
            case 'luxury':
              return numericRating >= 5 || 
                     hotelName.includes('luxury') || 
                     hotelName.includes('boutique') || 
                     hotelName.includes('grand') || 
                     hotelName.includes('palace');
            default:
              return false;
          }
        });
        
        if (!categoryMatch) {
          categoryFilteredOut++;
          if (isFirstHotel) {
            console.log(`  ❌ REJECTED by category filter`);
          }
          return false;
        } else if (isFirstHotel) {
          console.log(`  ✅ PASSED category filter`);
        }
      } else if (isFirstHotel) {
        console.log(`  ⚠️ No category filters active`);
      }

      // Property type filtering
      const propertyTypeFilters = selectedFilters.filter(filter => 
        ['hotel', 'apartment', 'resort', 'villa'].includes(filter)
      );
      
      if (propertyTypeFilters.length > 0) {
        if (isFirstHotel) console.log(`  🏨 Checking property type filters:`, propertyTypeFilters);
        
        const hotelName = hotel.HotelName?.toLowerCase() || '';
        const hotelTypeMatch = propertyTypeFilters.some(type => {
          switch (type) {
            case 'hotel':
              return hotelName.includes('hotel') || hotelName.includes('inn') || 
                     hotelName.includes('suite') || hotelName.includes('palace');
            case 'apartment':
              return hotelName.includes('apartment') || hotelName.includes('apartment') ||
                     hotelName.includes('suite') || hotelName.includes('residence');
            case 'resort':
              return hotelName.includes('resort') || hotelName.includes('beach') ||
                     hotelName.includes('spa') || hotelName.includes('golf');
            case 'villa':
              return hotelName.includes('villa') || hotelName.includes('chalet') ||
                     hotelName.includes('mansion') || hotelName.includes('estate');
            default:
              return false;
          }
        });
        if (!hotelTypeMatch) {
          typeFilteredOut++;
          if (isFirstHotel) {
            console.log(`  ❌ REJECTED by type filter: "${hotel.HotelName}" doesn't match ${propertyTypeFilters.join(', ')}`);
          }
          return false;
        } else if (isFirstHotel) {
          console.log(`  ✅ PASSED type filter`);
        }
      } else if (isFirstHotel) {
        console.log(`  ⚠️ No type filters active`);
      }

      // Location filtering (Same location or Nearby locations)
      const locationFilters = selectedFilters.filter(filter => 
        ['location-same', 'location-nearby'].includes(filter)
      );
      
      if (locationFilters.length > 0) {
        if (isFirstHotel) console.log(`  📍 Checking location filters:`, locationFilters);
        
        // For now, location-same shows all hotels, location-nearby can be implemented with coordinates
        // This is a placeholder - you can enhance this with actual coordinate-based distance calculation
        if (locationFilters.includes('location-same')) {
          // Same location - show all hotels
          if (isFirstHotel) console.log(`  ✅ PASSED location filter (same location)`);
        } else if (locationFilters.includes('location-nearby')) {
          // Nearby locations - could filter by distance if coordinates are available
          // For now, show all hotels as they're already in the same city
          if (isFirstHotel) console.log(`  ✅ PASSED location filter (nearby)`);
        }
      }

      // Amenity filtering
      const amenityFilters = selectedFilters.filter(filter => 
        ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'kitchen', 'ac', 'workspace', 'garden', 'concierge'].includes(filter)
      );
      
      if (amenityFilters.length > 0) {
        if (isFirstHotel) {
          console.log(`  🎯 Checking amenity filters:`, amenityFilters);
          console.log(`  📋 Hotel amenities:`, hotel.Amenities);
          console.log(`  📋 Hotel rooms:`, hotel.Rooms);
        }
        
        // Collect amenities from both hotel level and room level
        const hotelAmenities = hotel.Amenities || [];
        const roomAmenities: string[] = [];
        
        // Collect amenities from all rooms
        if (hotel.Rooms && Array.isArray(hotel.Rooms)) {
          hotel.Rooms.forEach((room: any) => {
            if (room.Amenities && Array.isArray(room.Amenities)) {
              roomAmenities.push(...room.Amenities);
            }
          });
        }
        
        // Combine hotel and room amenities, removing duplicates
        const allAmenities = [...hotelAmenities, ...roomAmenities]
          .map(a => String(a).toLowerCase())
          .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
        
        if (isFirstHotel) {
          console.log(`  📋 Combined amenities:`, allAmenities);
        }
        
        const amenityMatch = amenityFilters.every(amenity => {
          switch (amenity) {
            case 'wifi':
              return allAmenities.some(a => a.includes('wifi') || a.includes('internet') || a.includes('wireless'));
            case 'parking':
              return allAmenities.some(a => a.includes('parking') || a.includes('car park'));
            case 'pool':
              return allAmenities.some(a => a.includes('pool') || a.includes('swimming'));
            case 'gym':
              return allAmenities.some(a => a.includes('gym') || a.includes('fitness') || a.includes('exercise'));
            case 'restaurant':
              return allAmenities.some(a => a.includes('restaurant') || a.includes('dining') || a.includes('food'));
            case 'kitchen':
              return allAmenities.some(a => a.includes('kitchen') || a.includes('cooking'));
            case 'ac':
              return allAmenities.some(a => a.includes('air conditioning') || a.includes('ac') || a.includes('climate'));
            case 'workspace':
              return allAmenities.some(a => a.includes('workspace') || a.includes('business') || a.includes('office'));
            case 'garden':
              return allAmenities.some(a => a.includes('garden') || a.includes('terrace') || a.includes('patio'));
            case 'concierge':
              return allAmenities.some(a => a.includes('concierge') || a.includes('service') || a.includes('assistance'));
            default:
              return false;
          }
        });
        if (!amenityMatch) {
          amenityFilteredOut++;
          if (isFirstHotel) {
            console.log(`  ❌ REJECTED by amenity filter`);
          }
          return false;
        } else if (isFirstHotel) {
          console.log(`  ✅ PASSED amenity filter`);
        }
      } else if (isFirstHotel) {
        console.log(`  ⚠️ No amenity filters active`);
      }

      // Free cancellation filter
      if (selectedFilters.includes("Free cancellation")) {
        if (isFirstHotel) console.log(`  🔄 Checking free cancellation filter`);
        
        const hasFreeCancellation = hotel.CancellationPolicy?.toLowerCase().includes("free") ||
                                   hotel.CancellationPolicy?.toLowerCase().includes("refundable");
        if (!hasFreeCancellation) {
          cancellationFilteredOut++;
          if (isFirstHotel) {
            console.log(`  ❌ REJECTED by cancellation filter`);
          }
          return false;
        } else if (isFirstHotel) {
          console.log(`  ✅ PASSED cancellation filter`);
        }
      } else if (isFirstHotel) {
        console.log(`  ⚠️ No cancellation filter active`);
      }

      // Book now pay later / Zero payment option filter
      if (selectedFilters.includes("pay-later")) {
        if (isFirstHotel) console.log(`  💳 Checking pay later filter`);
        
        // Check if hotel has refundable rooms
        const hasRefundableRooms = 
          (hotel.Rooms && Array.isArray(hotel.Rooms) && hotel.Rooms.some((room: any) => 
            room.IsRefundable === 'true' || room.IsRefundable === true || 
            room.Refundable === true || room.Refundable === 'true'
          ));
        
        // Check hotel-level refundable flag
        const hasRefundableFlag = 
          hotel.IsRefundable === 'true' || hotel.IsRefundable === true ||
          hotel.Refundable === true || hotel.Refundable === 'true';
        
        // Check cancellation policy for free cancellation
        const hasFreeCancellation = 
          hotel.CancellationPolicy?.toLowerCase().includes('free') ||
          hotel.CancellationPolicy?.toLowerCase().includes('refundable') ||
          hotel.CancellationPolicy?.toLowerCase().includes('no charge');
        
        const hasPayLaterOption = hasRefundableRooms || hasRefundableFlag || hasFreeCancellation;
        
        if (!hasPayLaterOption) {
          if (isFirstHotel) {
            console.log(`  ❌ REJECTED by pay later filter`);
          }
          return false;
        } else if (isFirstHotel) {
          console.log(`  ✅ PASSED pay later filter`);
        }
      } else if (isFirstHotel) {
        console.log(`  ⚠️ No pay later filter active`);
      }

      if (isFirstHotel) {
        console.log(`  🎉 HOTEL PASSED ALL FILTERS!`);
      }

      return true;
    });

    console.log("📊 Filter Statistics:");
    console.log("  Total hotels:", hotels.length);
    console.log("  Filtered by price:", priceFilteredOut);
    console.log("  Filtered by star rating:", starFilteredOut);
    console.log("  Filtered by category:", categoryFilteredOut);
    console.log("  Filtered by type:", typeFilteredOut);
    console.log("  Filtered by amenities:", amenityFilteredOut);
    console.log("  Filtered by cancellation:", cancellationFilteredOut);
    console.log("  ✅ Passed all filters:", filtered.length);
    console.log("  Price range:", priceRange);
    console.log("  Active filters:", selectedFilters);
    
    return filtered;
  }, [hotels, priceRange, selectedFilters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, priceRange, viewMode]);

  // Re-translate hotels when language changes
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      const currentLanguage = localStorage.getItem("language") || "en";
      if (currentLanguage !== "en") {
        const translateHotels = async () => {
          const { translateHotelArray } = await import("@/services/apiTranslationService");
          const translated = await translateHotelArray(hotels, currentLanguage);
          setHotels(translated);
        };
        translateHotels();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Debug logging for render
  console.log("🔍 Rendering SearchResults with:");
  console.log("🏨 Total hotels:", hotels?.length || 0);
  console.log("🏨 Filtered hotels:", filteredHotels.length);
  console.log("🏨 Paginated hotels:", paginatedHotels.length);
  console.log("🏨 Loading state:", loading);
  console.log("🏨 Is searching:", isSearching);
  console.log("🏨 Error state:", error);
  console.log("🏨 Hotels array:", hotels);
  console.log("🏨 Paginated hotels:", paginatedHotels);
  console.log(
    "🏨 Should show hotels:",
    !loading && !error && !isSearching && paginatedHotels.length > 0
  );

  // Debug first hotel if exists
  if (hotels && hotels.length > 0) {
    console.log("🔍 First hotel details:", hotels[0]);
    console.log("🔍 First hotel price extraction:", {
      Price: hotels[0].Price,
      Rooms: hotels[0].Rooms,
      TotalFare: (hotels[0].Rooms as any)?.TotalFare,
      extractedPrice:
        hotels[0].Price ||
        (hotels[0].Rooms && (hotels[0].Rooms as any).TotalFare
          ? (hotels[0].Rooms as any).TotalFare
          : 100),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="w-full pt-32">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 border-b border-border">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {destination || "Featured Hotels"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {checkIn && checkOut ? (() => {
                    const formatDateDDMMYY = (dateStr: string) => {
                      const date = new Date(dateStr);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = String(date.getFullYear()).slice(-2);
                      return `${day}/${month}/${year}`;
                    };
                    return `${formatDateDDMMYY(checkIn)} - ${formatDateDDMMYY(checkOut)} • ${guests} guests`;
                  })() : "Search for available hotels"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8"
              >
                {showFilters ? (t?.close || "Hide Filters") : (t?.filters || "Show Filters")}
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                {t?.filters || "List"}
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="h-8"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                {t?.distance || "Map"}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row gap-6 py-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-full lg:w-80 xl:w-96">
                <div className="max-h-screen overflow-y-auto pr-4 space-y-6">
                  {/* Close Button */}
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Price Range */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                      {t?.filters || "Price range"}
                    </h3>
                    <div className="space-y-6">
                      <Slider
                        value={priceRange}
                        onValueChange={(range) =>
                          handlePriceRangeChange(range as [number, number])
                        }
                        max={50000}
                        min={50}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between">
                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                          <span className="text-sm font-semibold text-gray-700">
                            ${priceRange[0]}
                          </span>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                          <span className="text-sm font-semibold text-gray-700">
                            ${priceRange[1]}+
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                      Type of place
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        // Calculate dynamic counts based on actual hotel data
                        const calculatePropertyTypeCount = (typeId: string) => {
                          if (!hotels || !Array.isArray(hotels)) {
                            console.log("⚠️ No hotels data for property type count calculation");
                            return 0;
                          }
                          
                          const count = hotels.filter(hotel => {
                            const hotelName = hotel.HotelName?.toLowerCase() || '';
                            
                            switch (typeId) {
                              case 'hotel':
                                return hotelName.includes('hotel') || hotelName.includes('inn') || 
                                       hotelName.includes('suite') || hotelName.includes('palace');
                              case 'apartment':
                                return hotelName.includes('apartment') || hotelName.includes('apartment') ||
                                       hotelName.includes('suite') || hotelName.includes('residence');
                              case 'resort':
                                return hotelName.includes('resort') || hotelName.includes('beach') ||
                                       hotelName.includes('spa') || hotelName.includes('golf');
                              case 'villa':
                                return hotelName.includes('villa') || hotelName.includes('chalet') ||
                                       hotelName.includes('mansion') || hotelName.includes('estate');
                              default:
                                return false;
                            }
                          }).length;
                          
                          console.log(`🏨 Property type ${typeId} count:`, count);
                          return count;
                        };

                        return [
                          { id: "hotel", label: "Hotels", count: calculatePropertyTypeCount('hotel') },
                          { id: "apartment", label: "Apartments", count: calculatePropertyTypeCount('apartment') },
                          { id: "resort", label: "Resorts", count: calculatePropertyTypeCount('resort') },
                          { id: "villa", label: "Villas", count: calculatePropertyTypeCount('villa') },
                        ];
                      })().map((type) => (
                        <div
                          key={type.id}
                          className="flex items-center justify-between hover:bg-blue-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={type.id}
                              checked={selectedFilters.includes(type.id)}
                              onCheckedChange={() => {
                                const newFilters = selectedFilters.includes(type.id)
                                  ? selectedFilters.filter((id) => id !== type.id)
                                  : [...selectedFilters, type.id];
                                handleFiltersChange(newFilters);
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={type.id}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {type.label}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                            {type.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category of Hotels - Star Rating */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-3" />
                      Category of Hotels
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const calculateStarRatingCount = (stars: number) => {
                          if (!hotels || !Array.isArray(hotels)) return 0;
                          return hotels.filter(hotel => {
                            const rating = hotel.StarRating || hotel.Rating || hotel.rating || 0;
                            const numericRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
                            return Math.floor(numericRating) === stars;
                          }).length;
                        };

                        return [
                          { id: 'star-5', label: '5★', stars: 5, count: calculateStarRatingCount(5) },
                          { id: 'star-4', label: '4★', stars: 4, count: calculateStarRatingCount(4) },
                          { id: 'star-3', label: '3★', stars: 3, count: calculateStarRatingCount(3) }
                        ];
                      })().map((rating) => (
                        <div key={rating.id} className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={rating.id}
                              checked={selectedFilters.includes(rating.id)}
                              onCheckedChange={() => {
                                const newFilters = selectedFilters.includes(rating.id)
                                  ? selectedFilters.filter((id) => id !== rating.id)
                                  : [...selectedFilters, rating.id];
                                handleFiltersChange(newFilters);
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor={rating.id} className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                              <span className="flex items-center">
                                {Array.from({ length: rating.stars }).map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </span>
                              <span>{rating.label}</span>
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                            {rating.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hotel Category - Standard, Deluxe, Luxury */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <Sparkles className="w-5 h-5 text-purple-500 fill-purple-500 mr-3" />
                      Hotel Category
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const calculateCategoryCount = (categoryId: string) => {
                          if (!hotels || !Array.isArray(hotels)) return 0;
                          return hotels.filter(hotel => {
                            const rating = hotel.StarRating || hotel.Rating || hotel.rating || 0;
                            const numericRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
                            const hotelName = hotel.HotelName?.toLowerCase() || '';
                            
                            switch (categoryId) {
                              case 'standard':
                                return numericRating <= 3 || 
                                       hotelName.includes('standard') || 
                                       hotelName.includes('budget') || 
                                       hotelName.includes('economy');
                              case 'deluxe':
                                return numericRating === 4 || 
                                       hotelName.includes('deluxe') || 
                                       hotelName.includes('premium') || 
                                       hotelName.includes('superior');
                              case 'luxury':
                                return numericRating >= 5 || 
                                       hotelName.includes('luxury') || 
                                       hotelName.includes('boutique') || 
                                       hotelName.includes('grand') || 
                                       hotelName.includes('palace');
                              default:
                                return false;
                            }
                          }).length;
                        };

                        return [
                          { id: 'luxury', label: 'Luxury', count: calculateCategoryCount('luxury') },
                          { id: 'deluxe', label: 'Deluxe', count: calculateCategoryCount('deluxe') },
                          { id: 'standard', label: 'Standard', count: calculateCategoryCount('standard') }
                        ];
                      })().map((category) => (
                        <div key={category.id} className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={category.id}
                              checked={selectedFilters.includes(category.id)}
                              onCheckedChange={() => {
                                const newFilters = selectedFilters.includes(category.id)
                                  ? selectedFilters.filter((id) => id !== category.id)
                                  : [...selectedFilters, category.id];
                                handleFiltersChange(newFilters);
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                              {category.label}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <MapPin className="w-5 h-5 text-blue-500 fill-blue-500 mr-3" />
                      Location
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="location-same"
                            checked={selectedFilters.includes('location-same')}
                            onCheckedChange={() => {
                              const newFilters = selectedFilters.includes('location-same')
                                ? selectedFilters.filter((id) => id !== 'location-same')
                                : [...selectedFilters, 'location-same'];
                              handleFiltersChange(newFilters);
                            }}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label htmlFor="location-same" className="text-sm font-medium cursor-pointer">
                            Same location
                          </label>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {hotels?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="location-nearby"
                            checked={selectedFilters.includes('location-nearby')}
                            onCheckedChange={() => {
                              const newFilters = selectedFilters.includes('location-nearby')
                                ? selectedFilters.filter((id) => id !== 'location-nearby')
                                : [...selectedFilters, 'location-nearby'];
                              handleFiltersChange(newFilters);
                            }}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label htmlFor="location-nearby" className="text-sm font-medium cursor-pointer">
                            Nearby locations
                          </label>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {hotels?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options Filter - Book Now Pay Later */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <Wallet className="w-5 h-5 text-green-500 fill-green-500 mr-3" />
                      Payment Options
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const calculatePaymentOptionCount = () => {
                          if (!hotels || !Array.isArray(hotels)) return 0;
                          return hotels.filter(hotel => {
                            const hasRefundable = 
                              (hotel.Rooms && Array.isArray(hotel.Rooms) && hotel.Rooms.some((room: any) => 
                                room.IsRefundable === 'true' || room.IsRefundable === true || 
                                room.Refundable === true || room.Refundable === 'true'
                              )) ||
                              hotel.IsRefundable === 'true' || hotel.IsRefundable === true ||
                              hotel.Refundable === true || hotel.Refundable === 'true';
                            
                            const hasFreeCancellation = 
                              hotel.CancellationPolicy?.toLowerCase().includes('free') ||
                              hotel.CancellationPolicy?.toLowerCase().includes('refundable') ||
                              hotel.CancellationPolicy?.toLowerCase().includes('no charge');
                            
                            return hasRefundable || hasFreeCancellation;
                          }).length;
                        };

                        return calculatePaymentOptionCount();
                      })() > 0 && (
                        <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="pay-later"
                              checked={selectedFilters.includes('pay-later')}
                              onCheckedChange={() => {
                                const newFilters = selectedFilters.includes('pay-later')
                                  ? selectedFilters.filter((id) => id !== 'pay-later')
                                  : [...selectedFilters, 'pay-later'];
                                handleFiltersChange(newFilters);
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor="pay-later" className="text-sm font-medium cursor-pointer flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-green-600" />
                              <span>Book now, pay later</span>
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                            {(() => {
                              if (!hotels || !Array.isArray(hotels)) return 0;
                              return hotels.filter(hotel => {
                                const hasRefundable = 
                                  (hotel.Rooms && Array.isArray(hotel.Rooms) && hotel.Rooms.some((room: any) => 
                                    room.IsRefundable === 'true' || room.IsRefundable === true || 
                                    room.Refundable === true || room.Refundable === 'true'
                                  )) ||
                                  hotel.IsRefundable === 'true' || hotel.IsRefundable === true ||
                                  hotel.Refundable === true || hotel.Refundable === 'true';
                                
                                const hasFreeCancellation = 
                                  hotel.CancellationPolicy?.toLowerCase().includes('free') ||
                                  hotel.CancellationPolicy?.toLowerCase().includes('refundable') ||
                                  hotel.CancellationPolicy?.toLowerCase().includes('no charge');
                                
                                return hasRefundable || hasFreeCancellation;
                              }).length;
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
                      Amenities
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        // Calculate dynamic counts based on actual hotel data
                        const calculateAmenityCount = (amenityId: string) => {
                          if (!hotels || !Array.isArray(hotels)) {
                            console.log("⚠️ No hotels data for amenity count calculation");
                            return 0;
                          }
                          
                          const count = hotels.filter(hotel => {
                            // Collect amenities from both hotel level and room level
                            const hotelAmenities = hotel.Amenities || [];
                            const roomAmenities: string[] = [];
                            
                            // Collect amenities from all rooms
                            if (hotel.Rooms && Array.isArray(hotel.Rooms)) {
                              hotel.Rooms.forEach((room: any) => {
                                if (room.Amenities && Array.isArray(room.Amenities)) {
                                  roomAmenities.push(...room.Amenities);
                                }
                              });
                            }
                            
                            // Combine hotel and room amenities, removing duplicates
                            const allAmenities = [...hotelAmenities, ...roomAmenities]
                              .map(a => String(a).toLowerCase())
                              .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
                            
                            // Debug first hotel's amenities
                            if (hotels.indexOf(hotel) === 0) {
                              console.log("🔍 First hotel amenities:", {
                                hotelName: hotel.HotelName,
                                hotelAmenities: hotelAmenities,
                                roomAmenities: roomAmenities,
                                allAmenities: allAmenities
                              });
                            }
                            
                            switch (amenityId) {
                              case 'wifi':
                                return allAmenities.some(a => a.includes('wifi') || a.includes('internet') || a.includes('wireless'));
                              case 'parking':
                                return allAmenities.some(a => a.includes('parking') || a.includes('car park'));
                              case 'pool':
                                return allAmenities.some(a => a.includes('pool') || a.includes('swimming'));
                              case 'gym':
                                return allAmenities.some(a => a.includes('gym') || a.includes('fitness') || a.includes('exercise'));
                              case 'restaurant':
                                return allAmenities.some(a => a.includes('restaurant') || a.includes('dining') || a.includes('food'));
                              case 'kitchen':
                                return allAmenities.some(a => a.includes('kitchen') || a.includes('cooking'));
                              case 'ac':
                                return allAmenities.some(a => a.includes('air conditioning') || a.includes('ac') || a.includes('climate'));
                              case 'workspace':
                                return allAmenities.some(a => a.includes('workspace') || a.includes('business') || a.includes('office'));
                              case 'garden':
                                return allAmenities.some(a => a.includes('garden') || a.includes('terrace') || a.includes('patio'));
                              case 'concierge':
                                return allAmenities.some(a => a.includes('concierge') || a.includes('service') || a.includes('assistance'));
                              default:
                                return false;
                            }
                          }).length;
                          
                          console.log(`🏨 Amenity ${amenityId} count:`, count);
                          return count;
                        };

                        return [
                          { id: "wifi", label: "Wi-Fi", count: calculateAmenityCount('wifi') },
                          { id: "parking", label: "Free parking", count: calculateAmenityCount('parking') },
                          { id: "pool", label: "Pool", count: calculateAmenityCount('pool') },
                          { id: "gym", label: "Gym", count: calculateAmenityCount('gym') },
                          { id: "restaurant", label: "Restaurant", count: calculateAmenityCount('restaurant') },
                          { id: "kitchen", label: "Kitchen", count: calculateAmenityCount('kitchen') },
                          { id: "ac", label: "Air conditioning", count: calculateAmenityCount('ac') },
                          { id: "workspace", label: "Dedicated workspace", count: calculateAmenityCount('workspace') },
                          { id: "garden", label: "Garden", count: calculateAmenityCount('garden') },
                          { id: "concierge", label: "Concierge", count: calculateAmenityCount('concierge') },
                        ];
                      })().map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center justify-between hover:bg-blue-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={amenity.id}
                              checked={selectedFilters.includes(amenity.id)}
                              onCheckedChange={() => {
                                const newFilters = selectedFilters.includes(amenity.id)
                                  ? selectedFilters.filter((id) => id !== amenity.id)
                                  : [...selectedFilters, amenity.id];
                                handleFiltersChange(newFilters);
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={amenity.id}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {amenity.label}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                            {amenity.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="flex-1">
              
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t?.loading || "Searching..."}
                      </span>
                    ) : (
                      `${filteredHotels.length} ${t?.hotelsFound || "properties found"}`
                    )}
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {(loading || isSearching) && (
                <div className="flex items-center justify-center py-12 min-h-[400px]">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-lg font-medium">
                      {isSearching
                        ? (t?.loading || "Fetching hotels ...")
                        : (t?.loading || "Finding the best hotels for you...")}
                    </span>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {isSearching
                        ? (t?.loading || "Please wait while we fetch hotel data from our partners")
                        : (t?.loading || "Please wait while we search for available accommodations")}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && !isSearching && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error loading hotels: {error}</span>
                  </div>
                </div>
              )}

              {/* No Results State */}
              {!loading &&
                !error &&
                !isSearching &&
                filteredHotels.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {t?.noHotelsFound || "No hotels found"}
                      </h3>
                      <p className="text-muted-foreground">
                        {t?.tryDifferentSearch || "Try adjusting your filters or search criteria."}
                      </p>
                    </div>
                  </div>
                )}

              {/* Hotels Grid/List - Show if we have hotels */}
              {filteredHotels && filteredHotels.length > 0 && (
                <div className="space-y-6">
                  {viewMode === "list" ? (
                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full ${
                        showFilters ? "justify-start" : "justify-start"
                      }`}
                    >
                      {filteredHotels.map((hotel, index) => (
                        <AirbnbHotelCard
                          key={hotel.HotelCode || index}
                          hotel={hotel}
                          onHover={(isHovered) => {
                            setHoveredHotel(isHovered ? hotel.HotelCode : null);
                          }}
                          isSelected={hoveredHotel === hotel.HotelCode}
                        />
                      ))}
                    </div>
                  ) : (
                    <FakeMapView
                      hotels={filteredHotels.map((hotel) => ({
                        id: hotel.HotelCode,
                        name: hotel.HotelName,
                        location:
                          hotel.Address ||
                          hotel.Location?.Latitude +
                            "," +
                            hotel.Location?.Longitude ||
                          "Unknown",
                        price: (() => {
                          let price = hotel.Price;
                          console.log("🔍 FakeMapView price extraction:", {
                            hotelName: hotel.HotelName,
                            Price: hotel.Price,
                            Rooms: hotel.Rooms,
                            TotalFare: (hotel.Rooms as any)?.TotalFare,
                          });
                          // Always prioritize TotalFare from Rooms object (this is the real price from API)
                          if (hotel.Rooms && (hotel.Rooms as any).TotalFare) {
                            price = (hotel.Rooms as any).TotalFare;
                            console.log(
                              "✅ FakeMapView using TotalFare from Rooms:",
                              price
                            );
                          } else if (hotel.Price) {
                            price = hotel.Price;
                            console.log(
                              "⚠️ FakeMapView using hotel.Price as fallback:",
                              price
                            );
                          } else {
                            console.log(
                              "❌ FakeMapView no price found - Rooms:",
                              hotel.Rooms,
                              "Price:",
                              hotel.Price
                            );
                            price = 0; // No hardcoded fallback - show 0 if no price found
                          }
                          const finalPrice =
                            typeof price === "string"
                              ? parseFloat(price)
                              : price;
                          console.log(
                            "🔍 FakeMapView final price:",
                            finalPrice
                          );
                          return finalPrice;
                        })(),
                        rating: parseInt(hotel.StarRating) || 4,
                        reviews: Math.floor(Math.random() * 500) + 50,
                        images: [
                          hotel.FrontImage || "/api/placeholder/300/200",
                        ],
                        coordinates: {
                          lat:
                            hotel.Location?.Latitude ||
                            25.2048 + Math.random() * 0.1,
                          lng:
                            hotel.Location?.Longitude ||
                            55.2708 + Math.random() * 0.1,
                        },
                      }))}
                      selectedHotel={selectedHotel || hoveredHotel || undefined}
                      onHotelSelect={setSelectedHotel}
                      onHotelHover={setHoveredHotel}
                    />
                  )}
                </div>
              )}

              {/* Pagination - Temporarily disabled to show all hotels */}
              {false && totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
