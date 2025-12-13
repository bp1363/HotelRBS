import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Clock, User, Calendar, Users } from "lucide-react";
import { prebookHotel } from "@/services/bookingapi";
import { getHotelDetails, searchHotels } from "@/services/hotelApi";
import { APP_CONFIG, getCurrentDate, getDateFromNow } from "@/config/constants";
import { storeHotelAndRoom } from "@/services/hotelStorageApi";
import { useTranslation } from "@/contexts/TranslationContext";

const Reserve = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [loading, setIsLoading] = useState(false);
  const [prebookLoading, setPrebookLoading] = useState(false);
  const [prebookData, setPrebookData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get search parameters from URL
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const rooms = searchParams.get("rooms");
  const adultsCount = parseInt(searchParams.get("adults") || "2");
  const childrenCount = parseInt(searchParams.get("children") || "0");
  const childrenAgesParam = searchParams.get("childrenAges");
  const roomGuestsParam = searchParams.get("roomGuests");
  const roomsCount = parseInt(rooms || "1");
  
  // Parse children ages
  const childrenAges = childrenAgesParam 
    ? childrenAgesParam.split(",").map(age => parseInt(age))
    : [];

  // Parse room guests distribution
  const roomGuests = roomGuestsParam
    ? JSON.parse(roomGuestsParam)
    : Array(roomsCount).fill(null).map(() => ({ adults: Math.floor(adultsCount / roomsCount), children: 0, childrenAges: [] }));

  // Guest details state organized by room
  const [guestDetails, setGuestDetails] = useState<Array<{
    roomNumber: number;
    guests: Array<{ 
      title: string; 
      firstName: string; 
      lastName: string; 
      type: 'Adult' | 'Child';
      age?: number;
    }>;
  }>>(
    roomGuests.map((room: any, roomIndex: number) => ({
      roomNumber: roomIndex + 1,
      guests: [
        // Add adults for this room
        ...Array(room.adults || 1).fill(null).map(() => ({
          title: 'Mr',
          firstName: '',
          lastName: '',
          type: 'Adult' as const
        })),
        // Add children for this room
        ...Array(room.children || 0).fill(null).map((_, childIndex: number) => ({
          title: 'Master',
          firstName: '',
          lastName: '',
          type: 'Child' as const,
          age: room.childrenAges?.[childIndex] || 0
        }))
      ]
    }))
  );

  const fetchHotelDetails = async (hotelCode: string) => {
    setIsLoading(true);
    try {
      const response = await getHotelDetails(hotelCode);
      setHotelDetails(response.HotelDetails);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      // Provide mock data if API fails
      setHotelDetails({
        HotelCode: hotelCode,
        HotelName: "Sample Hotel",
        Address: "Sample Address",
        CityName: "Sample City",
        CountryName: "Sample Country",
        HotelRating: "4.5",
        FrontImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrebook = async () => {
    try {
      setPrebookLoading(true);
      setError(null);
      console.log("🔒 [NEW CODE v2] Starting prebook process with storage integration...");

      // First, get a real booking code from search API
      let bookingCode = null;
      let roomData = null;
      let hotelData = null;
      
      try {
        console.log("🔍 Getting real booking code from search API...");
        
      // Extract detailed guest information from URL params
      const adultsParam = parseInt(searchParams.get("adults") || "2");
      const childrenParam = parseInt(searchParams.get("children") || "0");
      const childrenAgesParam = searchParams.get("childrenAges");
      const roomGuestsParam = searchParams.get("roomGuests");
      const roomsCount = parseInt(rooms) || APP_CONFIG.DEFAULT_ROOMS;
      
      // Parse children ages
      const childrenAges = childrenAgesParam 
        ? childrenAgesParam.split(",").map(age => parseInt(age))
        : [];
      
      // Parse room guests distribution
      const roomGuests = roomGuestsParam
        ? JSON.parse(roomGuestsParam)
        : [];
      
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
        const adultsPerRoom = Math.floor(adultsParam / roomsCount);
        const childrenPerRoom = Math.floor(childrenParam / roomsCount);
        
        paxRooms = Array.from({ length: roomsCount }, (_, index) => {
          const isLastRoom = index === roomsCount - 1;
          const roomAdults = isLastRoom ? adultsParam - (adultsPerRoom * (roomsCount - 1)) : adultsPerRoom;
          const roomChildren = isLastRoom ? childrenParam - (childrenPerRoom * (roomsCount - 1)) : childrenPerRoom;
          
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
      
      const apiSearchParams = {
        CheckIn: checkIn || getCurrentDate(),
        CheckOut: checkOut || getDateFromNow(1),
        HotelCodes: id || "",
        GuestNationality: APP_CONFIG.DEFAULT_GUEST_NATIONALITY,
        PreferredCurrencyCode: APP_CONFIG.DEFAULT_CURRENCY,
        PaxRooms: paxRooms,
        IsDetailResponse: true,
        ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME
      };
        
        const searchResponse = await searchHotels(apiSearchParams);
        console.log("🔍 Search response for booking code:", searchResponse);
        
        if (searchResponse?.HotelResult) {
          const hotel = searchResponse.HotelResult;
          // Handle both array and object structures
          if (Array.isArray(hotel)) {
            const foundHotel = hotel.find(h => h.HotelCode === id);
            if (foundHotel?.Rooms && Array.isArray(foundHotel.Rooms) && foundHotel.Rooms.length > 0) {
              bookingCode = foundHotel.Rooms[0].BookingCode;
              roomData = foundHotel.Rooms[0];
              hotelData = foundHotel;
              console.log("✅ Found real booking code (array structure):", bookingCode);
            }
          } else if (hotel.HotelCode === id && hotel.Rooms && hotel.Rooms.BookingCode) {
            // Handle object structure where Rooms is an object
            bookingCode = hotel.Rooms.BookingCode;
            roomData = hotel.Rooms;
            hotelData = hotel;
            console.log("✅ Found real booking code (object structure):", bookingCode);
          }
        }
      } catch (searchError) {
        console.error("❌ Error getting booking code from search:", searchError);
      }
      
      // If no real booking code found, show error
      if (!bookingCode) {
        console.log("📭 No real booking code found");
        setError("No booking code available. Please try searching again.");
        return;
      }

      const prebookResponse = await prebookHotel({
        BookingCode: bookingCode,
        PaymentMode: "Limit",
      });

      console.log("✅ Prebook successful:", prebookResponse);
      console.log("🔍 Checking prebook status...");
      console.log("  - Status object:", prebookResponse.Status);
      console.log("  - Status code:", prebookResponse.Status?.Code);
      console.log("  - Code type:", typeof prebookResponse.Status?.Code);

      // Check if prebook was successful (handle both string "200" and number 200)
      if (prebookResponse.Status && (prebookResponse.Status.Code === "200" || prebookResponse.Status.Code === 200)) {
        console.log("✅ Status check passed! Proceeding with storage...");
        
        // Store hotel and room details in custom backend before proceeding
        try {
          console.log("💾 Storing hotel and room details...");
          console.log("📊 hotelDetails (from state):", hotelDetails);
          console.log("📊 hotelData (from search):", hotelData);
          console.log("📊 roomData (from search):", roomData);
          console.log("📊 bookingCode:", bookingCode);
          
          // Use hotelDetails from state if available, otherwise use from search
          const hotelToStore = hotelDetails || hotelData;
          const roomToStore = roomData;
          
          console.log("🎯 Final hotelToStore:", hotelToStore);
          console.log("🎯 Final roomToStore:", roomToStore);
          
          if (hotelToStore && roomToStore) {
            console.log("✅ Both hotel and room data available, calling storeHotelAndRoom...");
            await storeHotelAndRoom(hotelToStore, roomToStore, bookingCode);
            console.log("✅ Hotel and room details stored successfully");
          } else {
            console.warn("⚠️ Missing hotel or room data for storage");
            console.warn("  - Hotel data:", hotelToStore ? 'Available' : 'MISSING');
            console.warn("  - Room data:", roomToStore ? 'Available' : 'MISSING');
          }
        } catch (storageError) {
          console.error("❌ Failed to store hotel/room details:", storageError);
          // Don't fail the booking if storage fails, just log it
        }

        // Store the BookingCode with prebook data (prebook returns same code)
        console.log('🔑 BookingCode for this reservation:', bookingCode);
        
        setPrebookData({
          ...prebookResponse,
          BookingCode: bookingCode, // Prebook returns same BookingCode
        });
      } else {
        console.error("❌ Status check failed!");
        console.error("  - Expected: Status.Code === '200'");
        console.error("  - Got Status:", prebookResponse.Status);
        setError(prebookResponse.Status?.Description || "Prebook failed");
      }
    } catch (error) {
      console.error("Prebook error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setPrebookLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHotelDetails(id);
    }
  }, [id]);

  // Check if we have prebook data from navigation state
  useEffect(() => {
    if (location.state?.prebookData) {
      setPrebookData(location.state.prebookData);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading hotel details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t?.backToHotel || "Back to Hotel Details"}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {hotelDetails?.HotelName || "Hotel Name"}
                </CardTitle>
                <p className="text-muted-foreground">
                  {hotelDetails?.Address || "Hotel Address"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Check-in: {checkIn || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Check-out: {checkOut || "N/A"}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{guests || "N/A"} guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{rooms || "N/A"} rooms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prebook Status */}
            {prebookData ? (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Reservation Confirmed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Booking Reference</Label>
                        <p className="font-medium">{prebookData.BookingReference || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Total Amount</Label>
                        <p className="font-medium">
                          {prebookData.Currency} {prebookData.TotalAmount || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Expiry Time</Label>
                        <p className="font-medium">{prebookData.ExpiryTime || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <p className="font-medium text-green-600">
                          {prebookData.Status?.Description || "Confirmed"}
                        </p>
                      </div>
                    </div>
                    
                    <Alert className="mt-4">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Your reservation is confirmed! You can complete the booking by providing payment details.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Guest Details Form - Organized by Room */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t?.guestDetails || "Guest Details"}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t?.pleaseProvideGuestDetails || "Please provide details for all guests in each room"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {guestDetails.map((room, roomIndex) => (
                        <div key={`room-${roomIndex}`} className="border-2 border-primary/20 rounded-lg p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                          {/* Room Header */}
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-primary/30">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-primary">{t?.roomNumber || "Room"} {room.roomNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {room.guests.filter(g => g.type === 'Adult').length} {t?.adults || "Adult(s)"}, {room.guests.filter(g => g.type === 'Child').length} {t?.children || "Child(ren)"}
                              </p>
                            </div>
                          </div>

                          {/* Guests in this room */}
                          <div className="space-y-4">
                            {room.guests.map((guest, guestIndex) => (
                              <div 
                                key={`room-${roomIndex}-guest-${guestIndex}`} 
                                className={`p-4 border rounded-lg space-y-3 ${
                                  guest.type === 'Child' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  {guest.type === 'Adult' ? (
                                    <User className="h-4 w-4" />
                                  ) : (
                                    <Users className="h-4 w-4" />
                                  )}
                                  <span>
                                    {guest.type === 'Adult' ? (t?.adult || "Adult") : (t?.child || "Child")} {guestIndex + 1}
                                    {guest.type === 'Child' && ` (${t?.age || "Age"}: ${guest.age})`}
                                    {roomIndex === 0 && guestIndex === 0 && ` - ${t?.primaryGuest || "Primary Guest"}`}
                                  </span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <Label htmlFor={`room-${roomIndex}-guest-${guestIndex}-title`}>{t?.title || "Title"}</Label>
                                    <select
                                      id={`room-${roomIndex}-guest-${guestIndex}-title`}
                                      value={guest.title}
                                      onChange={(e) => {
                                        const newDetails = [...guestDetails];
                                        newDetails[roomIndex].guests[guestIndex].title = e.target.value;
                                        setGuestDetails(newDetails);
                                      }}
                                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                                    >
                                      <option value="Mr">Mr</option>
                                      <option value="Mrs">Mrs</option>
                                      <option value="Ms">Ms</option>
                                      <option value="Miss">Miss</option>
                                      <option value="Master">Master</option>
                                    </select>
                                  </div>
                                  <div>
                                    <Label htmlFor={`room-${roomIndex}-guest-${guestIndex}-firstName`}>{t?.firstName || "First Name"} *</Label>
                                    <Input
                                      id={`room-${roomIndex}-guest-${guestIndex}-firstName`}
                                      value={guest.firstName}
                                      onChange={(e) => {
                                        const newDetails = [...guestDetails];
                                        newDetails[roomIndex].guests[guestIndex].firstName = e.target.value;
                                        setGuestDetails(newDetails);
                                      }}
                                      placeholder={t?.firstName || "First name"}
                                      required
                                      className="bg-white dark:bg-gray-800"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`room-${roomIndex}-guest-${guestIndex}-lastName`}>{t?.lastName || "Last Name"} *</Label>
                                    <Input
                                      id={`room-${roomIndex}-guest-${guestIndex}-lastName`}
                                      value={guest.lastName}
                                      onChange={(e) => {
                                        const newDetails = [...guestDetails];
                                        newDetails[roomIndex].guests[guestIndex].lastName = e.target.value;
                                        setGuestDetails(newDetails);
                                      }}
                                      placeholder={t?.lastName || "Last name"}
                                      required
                                      className="bg-white dark:bg-gray-800"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reserve Button Card */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t?.reserveYourRoom || "Reserve Your Room"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t?.reserveRoomDescription || "Click the button below to reserve your room. This will hold your reservation for a limited time."}
                    </p>
                    
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button
                      onClick={handlePrebook}
                      disabled={prebookLoading}
                      className="w-full"
                      size="lg"
                    >
                      {prebookLoading ? (t?.processing || "Processing...") : (t?.reserveRoom || "Reserve Room")}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t?.bookingSummary || "Booking Summary"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t?.hotelName || "Hotel"}</span>
                    <span className="font-medium">{hotelDetails?.HotelName || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t?.checkIn || "Check-in"}</span>
                    <span className="font-medium">{checkIn || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t?.checkOut || "Check-out"}</span>
                    <span className="font-medium">{checkOut || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t?.guests || "Guests"}</span>
                    <span className="font-medium">{guests || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t?.rooms || "Rooms"}</span>
                    <span className="font-medium">{rooms || "N/A"}</span>
                  </div>
                  
                  {prebookData && (
                    <>
                      <hr />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t?.totalAmount || "Total Amount"}</span>
                        <span className="font-bold text-lg">
                          {prebookData.Currency} {prebookData.TotalAmount || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Reserve;
