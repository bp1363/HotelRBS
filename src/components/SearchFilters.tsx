import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  SlidersHorizontal, 
  X,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Utensils,
  ChefHat,
  Snowflake,
  Briefcase,
  Trees,
  Crown,
  Star,
  MapPin,
  Sparkles,
  CreditCard,
  Wallet
} from 'lucide-react';

interface SearchFiltersProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  totalResults: number;
  hotels: any[];
}

const SearchFilters = ({
  priceRange,
  setPriceRange,
  selectedFilters,
  setSelectedFilters,
  totalResults,
  hotels
}: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate dynamic counts based on actual hotel data
  const calculateAmenityCount = (amenityId: string) => {
    if (!hotels || !Array.isArray(hotels)) return 0;
    
    return hotels.filter(hotel => {
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
  };

  const calculatePropertyTypeCount = (typeId: string) => {
    if (!hotels || !Array.isArray(hotels)) return 0;
    
    return hotels.filter(hotel => {
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
  };

  // Calculate star rating count
  const calculateStarRatingCount = (stars: number) => {
    if (!hotels || !Array.isArray(hotels)) return 0;
    
    return hotels.filter(hotel => {
      const rating = hotel.StarRating || hotel.Rating || hotel.rating || 0;
      const numericRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
      return Math.floor(numericRating) === stars;
    }).length;
  };

  // Calculate category count (Standard, Deluxe, Luxury)
  const calculateCategoryCount = (categoryId: string) => {
    if (!hotels || !Array.isArray(hotels)) return 0;
    
    return hotels.filter(hotel => {
      const rating = hotel.StarRating || hotel.Rating || hotel.rating || 0;
      const numericRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
      const hotelName = hotel.HotelName?.toLowerCase() || '';
      
      switch (categoryId) {
        case 'standard':
          // Standard: 3 stars or name contains "standard", "budget", "economy"
          return numericRating <= 3 || 
                 hotelName.includes('standard') || 
                 hotelName.includes('budget') || 
                 hotelName.includes('economy');
        case 'deluxe':
          // Deluxe: 4 stars or name contains "deluxe", "premium", "superior"
          return numericRating === 4 || 
                 hotelName.includes('deluxe') || 
                 hotelName.includes('premium') || 
                 hotelName.includes('superior');
        case 'luxury':
          // Luxury: 5 stars or name contains "luxury", "boutique", "grand", "palace"
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

  // Calculate payment option count (Book now pay later / Zero payment)
  const calculatePaymentOptionCount = () => {
    if (!hotels || !Array.isArray(hotels)) return 0;
    
    return hotels.filter(hotel => {
      // Check if hotel has refundable rooms or free cancellation
      const hasRefundable = 
        (hotel.Rooms && Array.isArray(hotel.Rooms) && hotel.Rooms.some((room: any) => 
          room.IsRefundable === 'true' || room.IsRefundable === true || 
          room.Refundable === true || room.Refundable === 'true'
        )) ||
        hotel.IsRefundable === 'true' || hotel.IsRefundable === true ||
        hotel.Refundable === true || hotel.Refundable === 'true';
      
      // Check cancellation policy
      const hasFreeCancellation = 
        hotel.CancellationPolicy?.toLowerCase().includes('free') ||
        hotel.CancellationPolicy?.toLowerCase().includes('refundable') ||
        hotel.CancellationPolicy?.toLowerCase().includes('no charge');
      
      return hasRefundable || hasFreeCancellation;
    }).length;
  };

  const amenityFilters = [
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi, count: calculateAmenityCount('wifi') },
    { id: 'parking', label: 'Free parking', icon: Car, count: calculateAmenityCount('parking') },
    { id: 'pool', label: 'Pool', icon: Waves, count: calculateAmenityCount('pool') },
    { id: 'gym', label: 'Gym', icon: Dumbbell, count: calculateAmenityCount('gym') },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils, count: calculateAmenityCount('restaurant') },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat, count: calculateAmenityCount('kitchen') },
    { id: 'ac', label: 'Air conditioning', icon: Snowflake, count: calculateAmenityCount('ac') },
    { id: 'workspace', label: 'Dedicated workspace', icon: Briefcase, count: calculateAmenityCount('workspace') },
    { id: 'garden', label: 'Garden', icon: Trees, count: calculateAmenityCount('garden') },
    { id: 'concierge', label: 'Concierge', icon: Crown, count: calculateAmenityCount('concierge') }
  ];

  const propertyTypes = [
    { id: 'hotel', label: 'Hotels', count: calculatePropertyTypeCount('hotel') },
    { id: 'apartment', label: 'Apartments', count: calculatePropertyTypeCount('apartment') },
    { id: 'resort', label: 'Resorts', count: calculatePropertyTypeCount('resort') },
    { id: 'villa', label: 'Villas', count: calculatePropertyTypeCount('villa') }
  ];

  // Star rating filters (3*, 4*, 5*)
  const starRatings = [
    { id: 'star-5', label: '5★', stars: 5, count: calculateStarRatingCount(5) },
    { id: 'star-4', label: '4★', stars: 4, count: calculateStarRatingCount(4) },
    { id: 'star-3', label: '3★', stars: 3, count: calculateStarRatingCount(3) }
  ];

  // Category filters (Standard, Deluxe, Luxury)
  const hotelCategories = [
    { id: 'luxury', label: 'Luxury', count: calculateCategoryCount('luxury') },
    { id: 'deluxe', label: 'Deluxe', count: calculateCategoryCount('deluxe') },
    { id: 'standard', label: 'Standard', count: calculateCategoryCount('standard') }
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(
      selectedFilters.includes(filterId)
        ? selectedFilters.filter(id => id !== filterId)
        : [...selectedFilters, filterId]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setPriceRange([50, 50000]);
  };

  const activeFiltersCount = selectedFilters.length + (priceRange[0] !== 50 || priceRange[1] !== 50000 ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 relative bg-white hover:bg-gray-50 border-2 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl px-4 py-2.5"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {activeFiltersCount}
            </div>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-72 bg-gradient-to-b from-white to-gray-50/50">
        <SheetHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Filters
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg px-3 py-1.5"
            >
              Clear all
            </Button>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Price Range */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
              Price range
            </h3>
            <div className="space-y-6">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={50000}
                min={50}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between">
                <div className="bg-gray-50 px-3 py-2 rounded-lg border">
                  <span className="text-sm font-semibold text-gray-700">${priceRange[0]}</span>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border">
                  <span className="text-sm font-semibold text-gray-700">${priceRange[1]}+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category of Hotels - Star Rating */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-3" />
              Category of Hotels
            </h3>
            <div className="space-y-4">
              {starRatings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id={rating.id}
                      checked={selectedFilters.includes(rating.id)}
                      onCheckedChange={() => toggleFilter(rating.id)}
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
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full font-medium">{rating.count}</span>
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
              {hotelCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id={category.id}
                      checked={selectedFilters.includes(category.id)}
                      onCheckedChange={() => toggleFilter(category.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                      {category.label}
                    </label>
                  </div>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full font-medium">{category.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
              Type of place
            </h3>
            <div className="space-y-4">
              {propertyTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id={type.id}
                      checked={selectedFilters.includes(type.id)}
                      onCheckedChange={() => toggleFilter(type.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor={type.id} className="text-sm font-medium cursor-pointer">
                      {type.label}
                    </label>
                  </div>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full font-medium">{type.count}</span>
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
                    onCheckedChange={() => toggleFilter('location-same')}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="location-same" className="text-sm font-medium cursor-pointer">
                    Same location
                  </label>
                </div>
                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full font-medium">
                  {hotels?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="location-nearby"
                    checked={selectedFilters.includes('location-nearby')}
                    onCheckedChange={() => toggleFilter('location-nearby')}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="location-nearby" className="text-sm font-medium cursor-pointer">
                    Nearby locations
                  </label>
                </div>
                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full font-medium">
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
              <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="pay-later"
                    checked={selectedFilters.includes('pay-later')}
                    onCheckedChange={() => toggleFilter('pay-later')}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="pay-later" className="text-sm font-medium cursor-pointer flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span>Book now, pay later</span>
                  </label>
                </div>
                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full font-medium">
                  {calculatePaymentOptionCount()}
                </span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
              Amenities
            </h3>
            <div className="space-y-3">
              {amenityFilters.map((amenity) => {
                const Icon = amenity.icon;
                return (
                  <div key={amenity.id} className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={amenity.id}
                        checked={selectedFilters.includes(amenity.id)}
                        onCheckedChange={() => toggleFilter(amenity.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <label htmlFor={amenity.id} className="text-sm font-medium cursor-pointer">
                          {amenity.label}
                        </label>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full font-medium">{amenity.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t pt-6 bg-white rounded-t-xl shadow-lg -mx-6 px-6">
          <div className="flex items-center justify-between space-x-3">
            <Button 
              variant="outline" 
              onClick={clearAllFilters} 
              className="flex-1 border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 rounded-xl py-3 font-medium"
            >
              Clear all
            </Button>
            <Button 
              onClick={() => setIsOpen(false)} 
              className="flex-1 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl py-3 font-bold"
            >
              Show {totalResults} stays
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SearchFilters;