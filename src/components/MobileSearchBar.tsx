import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronDown,
  ChevronUp,
  X,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  getAllCities,
  searchCityByName,
  CitySearchResult
} from '@/services/hotelCodeApi';
import { cn } from '@/lib/utils';
import { NATIONALITIES, DEFAULT_NATIONALITY } from '@/config/nationalities';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/config/currencies';
import { useTranslation } from '@/contexts/TranslationContext';

interface MobileSearchBarProps {
  className?: string;
}

interface RoomGuests {
  adults: number;
  children: number;
  childrenAges: number[];
}

const MobileSearchBar: React.FC<MobileSearchBarProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    adults: 2,
    children: 0,
    rooms: 1
  });

  // Nationality and Currency State (synced with Header)
  const [nationality, setNationality] = useState<string>(() => {
    return localStorage.getItem("selectedNationality") || DEFAULT_NATIONALITY;
  });
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem("selectedCurrency") || DEFAULT_CURRENCY;
  });

  // Listen for nationality changes from Header
  useEffect(() => {
    const handleNationalityChange = (event: CustomEvent) => {
      setNationality(event.detail);
    };
    window.addEventListener("nationalityChanged", handleNationalityChange as EventListener);
    return () => {
      window.removeEventListener("nationalityChanged", handleNationalityChange as EventListener);
    };
  }, []);

  // Listen for currency changes from Header
  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail);
    };
    window.addEventListener("currencyChanged", handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange as EventListener);
    };
  }, []);

  // Room-by-room guest configuration
  const [roomGuests, setRoomGuests] = useState<RoomGuests[]>([
    { adults: 2, children: 0, childrenAges: [] }
  ]);
  
  // For API-based destination search (using custom APIs like web view)
  const [searchInput, setSearchInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [selectedCityData, setSelectedCityData] = useState<CitySearchResult | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const destinationRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const citySearchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-typing animation state
  const [autoTypingText, setAutoTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Trending destinations - starting with Dubai
  const trendingDestinations = ["Dubai", "New York", "Jeddah", "Riyadh", "Paris", "London"];
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);

  // Room management functions
  const addRoom = () => {
    if (roomGuests.length < 5) {
      setRoomGuests([...roomGuests, { adults: 1, children: 0, childrenAges: [] }]);
    }
  };

  const removeRoom = (index: number) => {
    if (roomGuests.length > 1) {
      setRoomGuests(roomGuests.filter((_, i) => i !== index));
    }
  };

  const updateRoomAdults = (roomIndex: number, adults: number) => {
    const updated = [...roomGuests];
    updated[roomIndex].adults = Math.max(1, Math.min(10, adults));
    setRoomGuests(updated);
  };

  const updateRoomChildren = (roomIndex: number, children: number) => {
    const updated = [...roomGuests];
    const newChildren = Math.max(0, Math.min(5, children));
    updated[roomIndex].children = newChildren;
    
    // Adjust childrenAges array
    if (newChildren > updated[roomIndex].childrenAges.length) {
      // Add default ages for new children
      updated[roomIndex].childrenAges = [
        ...updated[roomIndex].childrenAges,
        ...Array(newChildren - updated[roomIndex].childrenAges.length).fill(5)
      ];
    } else {
      // Remove excess ages
      updated[roomIndex].childrenAges = updated[roomIndex].childrenAges.slice(0, newChildren);
    }
    
    setRoomGuests(updated);
  };

  const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
    const updated = [...roomGuests];
    updated[roomIndex].childrenAges[childIndex] = age;
    setRoomGuests(updated);
  };

  const getTotalGuests = () => {
    return roomGuests.reduce((total, room) => total + room.adults + room.children, 0);
  };

  const getGuestLabel = () => {
    const totalGuests = getTotalGuests();
    const rooms = roomGuests.length;
    return `${totalGuests} Guest${totalGuests > 1 ? 's' : ''}, ${rooms} Room${rooms > 1 ? 's' : ''}`;
  };

  const handleSearch = () => {
    // Directly perform search with current nationality and currency values
    performSearch();
  };

  const performSearch = () => {
    // Validate that a city has been selected (same flow as web view)
    if (!selectedCityData || !searchData.destination) {
      console.error('❌ No city selected. Please select a destination from the suggestions.');
      alert('Please select a destination from the suggestions.');
      return;
    }

    // Validate dates are provided
    if (!searchData.checkIn || !searchData.checkOut) {
      console.error('❌ Dates required. Please select check-in and check-out dates.');
      alert('Please select both check-in and check-out dates.');
      return;
    }

    // Validate stay duration (max 30 days)
    const checkInDate = new Date(searchData.checkIn);
    const checkOutDate = new Date(searchData.checkOut);
    const stayDuration = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (stayDuration > 30) {
      console.error(`❌ Stay duration too long: ${stayDuration} days. Maximum is 30 days.`);
      alert(`Stay duration cannot exceed 30 days. Your selected dates result in ${stayDuration} days. Please select a shorter period.`);
      return;
    }

    if (stayDuration <= 0) {
      console.error('❌ Invalid stay duration. Check-out must be after check-in.');
      alert('Check-out date must be after check-in date.');
      return;
    }

    console.log('✅ Validations passed. Preparing search...');
    console.log('🏙️ Selected city data:', selectedCityData);
    
    // Calculate totals
    const totalAdults = roomGuests.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = roomGuests.reduce((sum, room) => sum + room.children, 0);
    const allChildrenAges = roomGuests.flatMap(room => room.childrenAges);
    
    // Build search parameters (same format as web view)
    const params = new URLSearchParams({
      destination: searchData.destination, // Format: "City Name, Country Name"
      guests: getTotalGuests().toString(),
      adults: totalAdults.toString(),
      children: totalChildren.toString(),
      rooms: roomGuests.length.toString(),
      nationality: nationality || DEFAULT_NATIONALITY,
      currency: currency || DEFAULT_CURRENCY
    });

    // Add children ages if there are children (same as web view)
    if (totalChildren > 0 && allChildrenAges.length > 0) {
      params.set("childrenAges", allChildrenAges.join(","));
    }

    // Add room guest distribution if available (same as web view)
    if (roomGuests.length > 0) {
      params.set("roomGuests", JSON.stringify(roomGuests));
    }

    // Format dates in local timezone (YYYY-MM-DD) to avoid timezone shift issues (same as web view)
    if (searchData.checkIn) {
      // If checkIn is already in YYYY-MM-DD format, use it directly
      // Otherwise parse and format it
      let checkInDate: Date;
      if (searchData.checkIn.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Already in correct format, parse it
        const [year, month, day] = searchData.checkIn.split('-').map(Number);
        checkInDate = new Date(year, month - 1, day);
      } else {
        checkInDate = new Date(searchData.checkIn);
      }
      const year = checkInDate.getFullYear();
      const month = String(checkInDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkInDate.getDate()).padStart(2, '0');
      params.set("checkIn", `${year}-${month}-${day}`);
    } else {
      // Default: 1 week from now
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() + 7);
      const year = defaultStartDate.getFullYear();
      const month = String(defaultStartDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultStartDate.getDate()).padStart(2, '0');
      params.set("checkIn", `${year}-${month}-${day}`);
    }
    
    if (searchData.checkOut) {
      // If checkOut is already in YYYY-MM-DD format, use it directly
      // Otherwise parse and format it
      let checkOutDate: Date;
      if (searchData.checkOut.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Already in correct format, parse it
        const [year, month, day] = searchData.checkOut.split('-').map(Number);
        checkOutDate = new Date(year, month - 1, day);
      } else {
        checkOutDate = new Date(searchData.checkOut);
      }
      const year = checkOutDate.getFullYear();
      const month = String(checkOutDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkOutDate.getDate()).padStart(2, '0');
      params.set("checkOut", `${year}-${month}-${day}`);
    } else {
      // Default: 3 days after check-in
      const checkInParam = params.get("checkIn");
      if (checkInParam) {
        const [year, month, day] = checkInParam.split('-').map(Number);
        const defaultEndDate = new Date(year, month - 1, day);
        defaultEndDate.setDate(defaultEndDate.getDate() + 3);
        const outYear = defaultEndDate.getFullYear();
        const outMonth = String(defaultEndDate.getMonth() + 1).padStart(2, '0');
        const outDay = String(defaultEndDate.getDate()).padStart(2, '0');
        params.set("checkOut", `${outYear}-${outMonth}-${outDay}`);
      }
    }

    console.log('🔍 Searching with preferences:', { nationality, currency });
    console.log('📅 Search params:', Object.fromEntries(params.entries()));
    console.log('🏙️ City codes will be fetched by SearchResults:', {
      cityName: selectedCityData.city_name,
      cityCode: selectedCityData.city_code,
      countryCode: selectedCityData.country_code
    });
    console.log('🔄 Flow: SearchResults will use city name to fetch codes → get hotel codes → search API');
    
    // Navigate to search page - SearchResults will:
    // 1. Extract city name from destination
    // 2. Use searchCityByName() to get cityCode and countryCode
    // 3. Use getHotelCodeList() with cityCode and countryCode to get hotel codes
    // 4. Call search API with hotel codes
    navigate(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  // Debounce search input for performance (mobile optimization)
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');

  // Debounce search input (only search after user stops typing for 300ms)
  useEffect(() => {
    if (citySearchDebounceRef.current) {
      clearTimeout(citySearchDebounceRef.current);
    }
    
    citySearchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);
    
    return () => {
      if (citySearchDebounceRef.current) {
        clearTimeout(citySearchDebounceRef.current);
      }
    };
  }, [searchInput]);

  // Search cities only when user types (lazy loading approach for mobile performance)
  useEffect(() => {
    const searchCities = async () => {
      // Only search if user has typed at least 2 characters (mobile optimization)
      if (debouncedSearchInput.trim().length < 2) {
        setFilteredCities([]);
        setIsLoadingCities(false);
        return;
      }
      
      setIsLoadingCities(true);
      try {
        console.log('🔍 Searching cities for:', debouncedSearchInput);
        
        // If we already have cities loaded, filter them client-side (fast)
        if (allCities.length > 0) {
          const filtered = allCities.filter(cityName =>
            cityName.toLowerCase().includes(debouncedSearchInput.toLowerCase())
          ).sort((a, b) => {
            const aName = a.toLowerCase();
            const bName = b.toLowerCase();
            const searchTerm = debouncedSearchInput.toLowerCase();
            
            if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
            if (!aName.startsWith(searchTerm) && bName.startsWith(searchTerm)) return 1;
            if (aName.includes(searchTerm) && !bName.includes(searchTerm)) return -1;
            if (!aName.includes(searchTerm) && bName.includes(searchTerm)) return 1;
            return aName.localeCompare(bName);
          }).slice(0, 50);
          setFilteredCities(filtered);
          setIsLoadingCities(false);
        } else {
          // For mobile: Only load all cities if user has typed 2+ characters
          // This reduces initial load time significantly
          console.log('🏙️ Loading cities for search (mobile optimized - lazy loading)...');
          const cityNames = await getAllCities();
          setAllCities(cityNames);
          
          const filtered = cityNames.filter(cityName =>
            cityName.toLowerCase().includes(debouncedSearchInput.toLowerCase())
          ).sort((a, b) => {
            const aName = a.toLowerCase();
            const bName = b.toLowerCase();
            const searchTerm = debouncedSearchInput.toLowerCase();
            
            if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
            if (!aName.startsWith(searchTerm) && bName.startsWith(searchTerm)) return 1;
            if (aName.includes(searchTerm) && !bName.includes(searchTerm)) return -1;
            if (!aName.includes(searchTerm) && bName.includes(searchTerm)) return 1;
            return aName.localeCompare(bName);
          }).slice(0, 50);
          setFilteredCities(filtered);
          setIsLoadingCities(false);
        }
      } catch (error) {
        console.error('❌ Error searching cities:', error);
        setFilteredCities([]);
        setIsLoadingCities(false);
      }
    };
    
    searchCities();
  }, [debouncedSearchInput, allCities]);
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle city selection (same as web view)
  const handleCitySelect = async (cityName: string) => {
    try {
      console.log('🏙️ City selected:', cityName);
      console.log('🔍 Fetching city details from custom API...');
      
      // Search for the city to get its codes
      const cityData = await searchCityByName(cityName);
      setSelectedCityData(cityData);
      
      const destinationValue = `${cityData.city_name}, ${cityData.country_name}`;
      setSearchData(prev => ({ ...prev, destination: destinationValue }));
      setSearchInput(destinationValue);
      setShowResults(false);
      
      console.log('✅ City details:', {
        city: cityData.city_name,
        cityCode: cityData.city_code,
        country: cityData.country_name,
        countryCode: cityData.country_code
      });
    } catch (error) {
      console.error('❌ Error fetching city details:', error);
      // Fallback: just use the city name
      setSearchData(prev => ({ ...prev, destination: cityName }));
      setSearchInput(cityName);
      setShowResults(false);
    }
  };
  
  // Handle input focus - don't load cities until user starts typing (mobile optimization)
  const handleDestinationFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowResults(true);
    // Don't load all cities on focus - wait for user to type (better for mobile performance)
    setHasUserInteracted(true);
    setIsTyping(false);
    setAutoTypingText("");
    
    // Scroll input into view when focused (especially on mobile) - ensure content above is visible
    setTimeout(() => {
      const inputElement = e.target;
      if (inputElement && scrollContainerRef.current && destinationRef.current) {
        // Get the destination container's position (includes the label above input)
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const destinationRect = destinationRef.current.getBoundingClientRect();
        
        // Calculate the scroll position needed to show the destination section fully
        const scrollTop = scrollContainerRef.current.scrollTop;
        const relativeTop = destinationRect.top - containerRect.top + scrollTop;
        
        // Scroll to show the destination section with padding at the top (so label is visible)
        scrollContainerRef.current.scrollTo({
          top: Math.max(0, relativeTop - 16), // 16px padding to show label above
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  // Auto-typing effect - only when no value and user hasn't interacted
  useEffect(() => {
    if (searchData.destination || searchInput || hasUserInteracted || isOpen) {
      setIsTyping(false);
      setAutoTypingText("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    const deleteDestination = (dest: string) => {
      let currentIndex = dest.length;
      
      const deleteChar = () => {
        if (currentIndex > 0) {
          setAutoTypingText(dest.slice(0, currentIndex - 1));
          currentIndex--;
          typingTimeoutRef.current = setTimeout(deleteChar, 50); // Faster deletion
        } else {
          // Move to next destination
          setCurrentDestinationIndex((prev) => (prev + 1) % trendingDestinations.length);
        }
      };
      
      deleteChar();
    };

    const typeDestination = (dest: string) => {
      let currentIndex = 0;
      setAutoTypingText("");
      
      const typeChar = () => {
        if (currentIndex < dest.length) {
          setAutoTypingText(dest.slice(0, currentIndex + 1));
          currentIndex++;
          typingTimeoutRef.current = setTimeout(typeChar, 100); // Typing speed: 100ms per character
        } else {
          // Finished typing, wait then delete and move to next
          typingTimeoutRef.current = setTimeout(() => {
            deleteDestination(dest);
          }, 2000); // Show for 2 seconds before deleting
        }
      };
      
      typeChar();
    };

    // Start auto-typing after a short delay
    const startDelay = setTimeout(() => {
      setIsTyping(true);
      typeDestination(trendingDestinations[currentDestinationIndex]);
    }, 1000);

    return () => {
      clearTimeout(startDelay);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData.destination, searchInput, hasUserInteracted, isOpen, currentDestinationIndex]);

  // Reset scroll position when sheet opens to ensure content is visible from top
  useEffect(() => {
    if (isOpen) {
      // Reset scroll to top when sheet opens (after animation completes)
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 100); // Small delay to ensure sheet is fully rendered
      return () => clearTimeout(timer);
    } else {
      // Reset scroll position after sheet closes too
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset interaction state when sheet closes (if no destination selected)
  useEffect(() => {
    if (!isOpen && !searchData.destination && !searchInput) {
      // Reset after a delay to allow smooth transition
      const resetTimer = setTimeout(() => {
        setHasUserInteracted(false);
      }, 500);
      return () => clearTimeout(resetTimer);
    }
  }, [isOpen, searchData.destination, searchInput]);

  const hasDestination = Boolean(searchData.destination);
  const showInputSearchIcon = searchInput.trim().length === 0;

  return (
    <div className={`mobile-search-bar ${className}`}>
      {/* Mobile Search Trigger Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-14 px-4 text-left font-normal bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className={`flex items-center ${hasDestination ? 'space-x-2' : 'space-x-3'}`}>
              {!hasDestination && <Search className="h-5 w-5 text-gray-600 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 font-normal">
                  {searchData.destination ? (
                    searchData.destination
                  ) : isTyping && autoTypingText ? (
                    <span className="inline-flex items-center">
                      {autoTypingText}
                      <span className="inline-block w-0.5 h-3 bg-primary ml-1 animate-pulse" />
                    </span>
                  ) : (
                    t?.whereAreYouGoing || 'Where are you going?'
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {searchData.checkIn && searchData.checkOut 
                    ? (() => {
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
                        return `${formatDateDDMMYY(searchData.checkIn)} • ${formatDateDDMMYY(searchData.checkOut)} • ${getGuestLabel()}`;
                      })()
                    : (t?.enterDetails || 'Enter details')
                  }
                </div>
              </div>
            </div>
          </Button>
        </SheetTrigger>

        <SheetContent 
          side="bottom" 
          className="h-[calc(100vh-100px)] bg-white rounded-t-2xl border-0 shadow-2xl flex flex-col p-0 gap-0 z-[9998] [&>button]:hidden"
        >
          {/* Header - Always Visible at Top, Outside Scroll Container */}
          <SheetHeader className="py-2 px-4 border-b border-gray-100 flex-shrink-0 bg-white m-0 z-20 relative">
            <div className="flex items-center justify-between w-full">
              <SheetTitle className="text-base font-semibold text-gray-900 flex-1 text-center m-0">Search Hotels</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Search Form - Scrollable Content Below Header */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative" 
            style={{ 
              WebkitOverflowScrolling: 'touch', 
              touchAction: 'pan-y',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="p-4 pt-4 space-y-6">
              {/* Destination - Single-step City Search (same as web view) */}
              <div className="space-y-2" ref={destinationRef}>
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {t?.searchCity || "Search City"}
                </Label>
                
                <div className="relative z-10">
                  <div className="relative z-20">
                    {showInputSearchIcon && (
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-30" />
                    )}
                    <div className="relative w-full z-20">
                      <Input
                        type="text"
                        value={searchInput}
                        onChange={(e) => {
                          setSearchInput(e.target.value);
                          setShowResults(true);
                          setHasUserInteracted(true);
                          setIsTyping(false);
                          setAutoTypingText("");
                        }}
                        onFocus={handleDestinationFocus}
                        placeholder={!searchInput && isTyping && autoTypingText ? "" : "Search cities..."}
                        className={cn(
                          "h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent relative z-20 bg-white font-normal",
                          showInputSearchIcon ? "pl-12 pr-4" : "px-4"
                        )}
                      />
                      {!searchInput && isTyping && autoTypingText && (
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center z-10 ${showInputSearchIcon ? 'left-12' : 'left-4'}`}>
                          {autoTypingText}
                          <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
                        </div>
                      )}
                    </div>
                    {isLoadingCities && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary animate-spin z-30" />
                    )}
                  </div>
                  
                  {/* City Results - Appears below input */}
                  {showResults && !isLoadingCities && filteredCities.length > 0 && (
                    <div className="absolute z-40 w-full mt-2 top-[100%] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', pointerEvents: 'auto' }}>
                      {filteredCities.map((cityName, index) => (
                        <button
                          key={index}
                          onClick={() => handleCitySelect(cityName)}
                          className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                          style={{ touchAction: 'manipulation' }}
                        >
                          <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 font-medium">{cityName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Loading State */}
                  {isLoadingCities && showResults && (
                    <div className="absolute z-40 w-full mt-2 top-[100%] bg-white border border-gray-200 rounded-lg shadow-lg p-4" style={{ pointerEvents: 'auto' }}>
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        <p className="text-sm text-gray-600">Loading cities...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* No Results */}
                  {showResults && !isLoadingCities && searchInput && filteredCities.length === 0 && (
                    <div className="absolute z-40 w-full mt-2 top-[100%] bg-white border border-gray-200 rounded-lg shadow-lg p-4" style={{ pointerEvents: 'auto' }}>
                      <p className="text-sm text-gray-500 text-center">
                        {searchInput ? `No cities found matching "${searchInput}"` : 'Start typing to search cities'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t?.checkIn || "Check in"}
                </Label>
                <Input
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => {
                    const checkInValue = e.target.value;
                    setSearchData(prev => {
                      // Automatically set checkout to next day when checkin is selected
                      let checkOutValue = prev.checkOut;
                      if (checkInValue) {
                        const checkInDate = new Date(checkInValue);
                        const nextDay = new Date(checkInDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        checkOutValue = nextDay.toISOString().split('T')[0];
                      }
                      return { ...prev, checkIn: checkInValue, checkOut: checkOutValue };
                    });
                  }}
                  className="h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t?.checkOut || "Check out"}
                </Label>
                <Input
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkOut: e.target.value }))}
                  className="h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Guests - Room by Room Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                    {t?.guestsRooms || "Guests & Rooms"}
                </Label>
                  <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {getGuestLabel()}
                  </div>
                </div>

                {/* Room Cards */}
                <div className="space-y-3">
                  {roomGuests.map((room, roomIndex) => (
                    <div 
                      key={roomIndex} 
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3"
                    >
                      {/* Room Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                            Room {roomIndex + 1}
                          </div>
                        </div>
                        {roomGuests.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoom(roomIndex)}
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Adults */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 font-medium">Adults</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRoomAdults(roomIndex, room.adults - 1)}
                              disabled={room.adults <= 1}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-semibold">{room.adults}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRoomAdults(roomIndex, room.adults + 1)}
                              disabled={room.adults >= 10}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 font-medium">Children</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRoomChildren(roomIndex, room.children - 1)}
                              disabled={room.children <= 0}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-semibold">{room.children}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRoomChildren(roomIndex, room.children + 1)}
                              disabled={room.children >= 5}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              +
                    </Button>
                          </div>
                        </div>

                        {/* Children Ages */}
                        {room.children > 0 && (
                          <div className="mt-2 space-y-2">
                            <p className="text-xs text-gray-600">Ages of children at check-out:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {room.childrenAges.map((age, childIndex) => (
                                <div key={childIndex} className="space-y-1">
                                  <Label className="text-xs text-gray-600">Child {childIndex + 1}</Label>
                                  <select
                                    value={age}
                                    onChange={(e) => updateChildAge(roomIndex, childIndex, parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                                  >
                                    {Array.from({ length: 18 }, (_, i) => i).map(ageOption => (
                                      <option key={ageOption} value={ageOption}>
                                        {ageOption} {ageOption === 1 ? 'year' : 'years'}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Room Button */}
                {roomGuests.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRoom}
                    className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors"
                  >
                    + Add Another Room
                  </Button>
                )}
              </div>

              </div>
          </div>

          {/* Search Button - Fixed at Bottom, Outside Scroll Container */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <Button 
              onClick={handleSearch}
              className="search-button w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Search className="h-5 w-5 mr-2" />
              Search Hotels
            </Button>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default MobileSearchBar;
