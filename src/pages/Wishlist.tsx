import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getWishlist, WishlistItem, removeFromWishlist } from "@/services/wishlistApi";
import { getHotelDetails } from "@/services/hotelApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import BookingDetailsModal, { BookingDetails } from "@/components/BookingDetailsModal";
import { useTranslation } from "@/contexts/TranslationContext";
import SearchModal from "@/components/SearchModal";

interface EnrichedWishlistItem extends WishlistItem {
  hotelDetails?: any;
  isLoadingDetails?: boolean;
}

const Wishlist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<EnrichedWishlistItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const [removingHotelCode, setRemovingHotelCode] = useState<string | null>(null);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<{
    hotelCode: string;
    hotelName: string;
  } | null>(null);

  // Search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Handle hotel click - open booking modal
  const handleHotelClick = (hotelCode: string, hotelName: string) => {
    setSelectedHotel({ hotelCode, hotelName });
    setIsBookingModalOpen(true);
  };

  // Handle booking confirmation - navigate to hotel details
  const handleBookingConfirm = (bookingDetails: BookingDetails) => {
    if (!selectedHotel) return;

    const searchParams = new URLSearchParams({
      checkIn: bookingDetails.checkIn,
      checkOut: bookingDetails.checkOut,
      guests: String(bookingDetails.adults + bookingDetails.children),
      adults: String(bookingDetails.adults),
      children: String(bookingDetails.children),
      rooms: String(bookingDetails.rooms),
      roomGuests: JSON.stringify(bookingDetails.roomGuests),
    });

    navigate(`/hotel/${selectedHotel.hotelCode}?${searchParams.toString()}`);
    setIsBookingModalOpen(false);
    setSelectedHotel(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedHotel(null);
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!user || !user.customer_id) return;
    
    setIsLoadingWishlist(true);
    setWishlistError(null);
    
    try {
      console.log('💖 Fetching wishlist for customer:', user.customer_id);
      const response = await getWishlist(user.customer_id);
      
      if (response.success && response.data) {
        const enrichedWishlist: EnrichedWishlistItem[] = response.data.map(item => ({
          ...item,
          isLoadingDetails: true
        }));
        setWishlist(enrichedWishlist);
        console.log('✅ Fetched', response.data.length, 'wishlist items');
        
        // Fetch hotel details for each item
        enrichedWishlist.forEach(async (item, index) => {
          const hotelCode = item.hotel_code || item['Hotel Code'];
          console.log(`🔍 Fetching details for hotel ${hotelCode} at index ${index}`);
          
          if (hotelCode) {
            try {
              const hotelDetails = await getHotelDetails(hotelCode);
              console.log(`✅ Hotel details fetched for ${hotelCode}:`, hotelDetails);
              
              setWishlist(prev => {
                const updated = [...prev];
                updated[index] = {
                  ...updated[index],
                  hotelDetails,
                  isLoadingDetails: false
                };
                return updated;
              });
            } catch (error) {
              console.error(`❌ Failed to fetch details for hotel ${hotelCode}:`, error);
              setWishlist(prev => {
                const updated = [...prev];
                updated[index] = {
                  ...updated[index],
                  isLoadingDetails: false
                };
                return updated;
              });
            }
          } else {
            console.log(`⚠️ No hotel code found for item at index ${index}:`, item);
          }
        });
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      setWishlistError('Failed to load wishlist. Please try again.');
      setWishlist([]);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  // Fetch wishlist on component mount
  useEffect(() => {
    if (isAuthenticated && user && user.customer_id) {
      console.log('🔍 Wishlist page loaded - User authenticated, fetching wishlist...');
      console.log('👤 User customer_id:', user.customer_id);
      fetchWishlist();
    } else {
      console.log('⚠️ Waiting for user authentication...');
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="w-full py-8 px-6 max-w-7xl mx-auto"
        style={{
          paddingTop: "140px",
        }}
      >
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          {t?.myWishlist || "Your Wishlist"}
        </h1>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                {t?.savedHotels || "Saved Hotels"}
              </CardTitle>
              <Button 
                onClick={fetchWishlist} 
                disabled={isLoadingWishlist}
                size="sm"
                variant="outline"
              >
                {isLoadingWishlist ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t?.loading || "Loading..."}
                  </>
                ) : (
                  t?.refresh || 'Refresh'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {isLoadingWishlist && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">{t?.loading || "Loading wishlist..."}</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {wishlistError && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
                <p className="text-sm">{wishlistError}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingWishlist && !wishlistError && wishlist.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t?.noSavedHotels || "No saved hotels yet"}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t?.startAddingHotels || "Start adding hotels to your wishlist by clicking the heart icon on hotel details pages"}
                  </p>
                </div>
                <Button onClick={() => setIsSearchModalOpen(true)} variant="outline">
                  Browse Hotels
                </Button>
              </div>
            )}

            {/* Wishlist Grid */}
            {!isLoadingWishlist && !wishlistError && wishlist.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => {
                  // Get hotel code - support both formats
                  const hotelCode = item.hotel_code || item['Hotel Code'] || '';
                  const wishlistId = item.wishlist_id || item['Wishlist ID'] || '';
                  
                  // Use fetched hotel details if available, otherwise use stored data
                  const details = item.hotelDetails;
                  
                  // Debug logging
                  console.log('🔍 Wishlist item data:', {
                    item,
                    details,
                    hotelCode,
                    wishlistId
                  });
                  
                  // Extract hotel details from API response structure
                  const hotelDetails = details?.HotelDetails || details;
                  
                  console.log('🔍 Extracted hotel details:', {
                    hotelDetails,
                    hotelNameFromDetails: hotelDetails?.HotelName,
                    imagesFromDetails: hotelDetails?.Images,
                    storedHotelName: item.hotel_name || item['Hotel Name']
                  });
                  
                  // Prioritize stored data from wishlist, then fallback to API details
                  const hotelName = item.hotel_name || item['Hotel Name'] || hotelDetails?.HotelName || 'Hotel Details Not Available';
                  const hotelRating = item.hotel_rating || item['Hotel Rating'] || hotelDetails?.HotelRating || 0;
                  const address = item.address || item['Address'] || hotelDetails?.Address || '';
                  const city = item.city || item['City'] || hotelDetails?.CityName || '';
                  const country = item.country || item['Country'] || hotelDetails?.CountryName || '';
                  const price = item.price || item['Price'] || hotelDetails?.Price || 0;
                  const currency = item.currency || item['Currency'] || hotelDetails?.Currency || 'USD';
                  const imageUrl = item.image_url || item['Image URL'] || hotelDetails?.FrontImage || hotelDetails?.Images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
                  const searchParamsStr = item.search_params || item['Search Params'] || '';
                  
                  console.log('🔍 Final extracted values:', {
                    hotelName,
                    imageUrl,
                    hotelRating,
                    address,
                    city,
                    country,
                    price,
                    currency
                  });
                  
                  // Parse stored search parameters or use defaults
                  let searchParams;
                  try {
                    const storedParams = searchParamsStr ? JSON.parse(searchParamsStr) : null;
                    
                    if (storedParams && storedParams.checkIn) {
                      // Use stored search parameters
                      searchParams = new URLSearchParams(storedParams);
                    } else {
                      // Fallback to default parameters
                      const today = new Date();
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      
                      const formatDate = (date: Date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      };
                      
                      searchParams = new URLSearchParams({
                        checkIn: formatDate(today),
                        checkOut: formatDate(tomorrow),
                        guests: '2',
                        adults: '2',
                        children: '0',
                        rooms: '1',
                        roomGuests: JSON.stringify([{ adults: 2, children: 0, childrenAges: [] }])
                      });
                    }
                  } catch (error) {
                    console.error('Error parsing search params:', error);
                    // Fallback to default
                    searchParams = new URLSearchParams({
                      checkIn: new Date().toISOString().split('T')[0],
                      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      guests: '2',
                      adults: '2',
                      children: '0',
                      rooms: '1',
                      roomGuests: JSON.stringify([{ adults: 2, children: 0, childrenAges: [] }])
                    });
                  }
                  
                  return (
                  <div
                    key={wishlistId}
                    className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleHotelClick(hotelCode, hotelName)}
                  >
                    {/* Hotel Image */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={hotelName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 hover:bg-white shadow-md transition-all duration-200 hover:scale-110"
                          disabled={removingHotelCode === hotelCode}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!user || !user.customer_id) return;
                            
                            setRemovingHotelCode(hotelCode);
                            
                            try {
                              console.log('💔 Removing hotel from wishlist:', hotelName);
                              await removeFromWishlist(user.customer_id, hotelCode);
                              
                              // Show success toast
                              toast({
                                title: "Removed from wishlist",
                                description: `${hotelName} has been removed from your wishlist.`,
                                variant: "default",
                              });
                              
                              // Refresh wishlist after removal
                              await fetchWishlist();
                            } catch (error) {
                              console.error('Error removing from wishlist:', error);
                              toast({
                                title: "Error",
                                description: "Failed to remove hotel from wishlist. Please try again.",
                                variant: "destructive",
                              });
                            } finally {
                              setRemovingHotelCode(null);
                            }
                          }}
                        >
                          {removingHotelCode === hotelCode ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <Heart className="h-4 w-4 fill-red-500 text-red-500 transition-all duration-200 hover:scale-110" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Hotel Info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-base mb-1 line-clamp-1">
                        {hotelName}
                      </h4>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {hotelRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{hotelRating}</span>
                          </div>
                        )}
                      </div>

                      {(address || city || country) && (
                        <div className="flex items-start gap-1 mb-3">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {[address, city, country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      {price > 0 && (
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="text-lg font-bold text-primary">
                              {currency} {price}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      )}
                      
                      {(!hotelName || hotelName === 'Hotel Details Not Available') && (
                        <div className="pt-3 border-t">
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isBookingModalOpen}
        onClose={handleModalClose}
        onConfirm={handleBookingConfirm}
        hotelName={selectedHotel?.hotelName || ""}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export default Wishlist;
