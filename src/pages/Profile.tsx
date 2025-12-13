import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getBookingsByDateRange, extractBookings, getDefaultDateRange, formatDateForAPI, BookingItem, getBookingByReferenceId, getBookingFromCustomAPI } from "@/services/bookingsApi";
import { getBookingDetails } from "@/services/bookingDetailsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CalendarIcon,
  Search,
  CheckCircle,
  Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Bookings state
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  
  // Date filter state
  const defaultDates = getDefaultDateRange();
  const [fromDate, setFromDate] = useState<string>(defaultDates.fromDate.split('T')[0]); // YYYY-MM-DD
  const [toDate, setToDate] = useState<string>(defaultDates.toDate.split('T')[0]); // YYYY-MM-DD
  
  // Booking lookup by reference ID state
  const [bookingRefId, setBookingRefId] = useState<string>('');
  const [lookedUpBooking, setLookedUpBooking] = useState<BookingItem | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Fetch bookings by date range
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    setBookingsError(null);
    
    try {
      console.log('🔍 Fetching bookings from', fromDate, 'to', toDate);
      
      // Convert date strings to ISO format for API
      const fromDateTime = new Date(fromDate + 'T00:00:00.000Z');
      const toDateTime = new Date(toDate + 'T23:59:59.999Z');
      
      const response = await getBookingsByDateRange(
        formatDateForAPI(fromDateTime),
        formatDateForAPI(toDateTime)
      );
      
      const bookingsList = extractBookings(response);
      setBookings(bookingsList);
      console.log('✅ Fetched', bookingsList.length, 'bookings');
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setBookingsError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Look up booking by reference ID using custom API
  const handleLookupBooking = async () => {
    // Use customer_id from authenticated user for lookup
    if (!user || !user.customer_id) {
      setLookupError('Please log in to view your bookings');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setLookedUpBooking(null);

    try {
      console.log('🔍 Looking up bookings with custom API for customer:', user.customer_id);
      const response = await getBookingFromCustomAPI(user.customer_id);
      
      console.log('📦 Custom API Lookup response:', response);
      console.log('📦 Full response JSON:', JSON.stringify(response, null, 2));
      
      // Display the raw API response directly
      if (response) {
        console.log('✅ Raw booking from custom API:', response);
        
        // Check if response has nested data structure
        let bookingData = response;
        if (response.data) {
          console.log('🔍 Found data field in manual lookup, checking type...');
          
          // If data is a string, try to parse it as JSON
          if (typeof response.data === 'string') {
            try {
              console.log('🔍 Data is a JSON string in manual lookup, parsing...');
              bookingData = JSON.parse(response.data);
              console.log('✅ Successfully parsed JSON string in manual lookup');
            } catch (e) {
              console.error('❌ Failed to parse JSON string in manual lookup:', e);
              bookingData = response;
            }
          } else if (Array.isArray(response.data)) {
            console.log('🔍 Data is an array in manual lookup, extracting first element...');
            if (response.data.length > 0) {
              bookingData = response.data[0];
              console.log('✅ Extracted first element from array in manual lookup:', bookingData);
            } else {
              console.log('⚠️ Array is empty in manual lookup');
              bookingData = response;
            }
          } else if (typeof response.data === 'object') {
            console.log('🔍 Data is already an object in manual lookup, using directly');
            bookingData = response.data;
          }
        }
        
        console.log('✅ Final booking data for manual lookup:', bookingData);
        
        // Store the booking data (either flattened or original)
        setLookedUpBooking(bookingData);
      } else {
        // Handle error response from custom API
        setLookupError(`No booking found with reference ID: ${bookingRefId}`);
      }
    } catch (error) {
      console.error('❌ Error looking up booking:', error);
      setLookupError('Failed to lookup booking. Please check the reference ID and try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Auto-fetch bookings from custom API using customer_id
  const fetchSampleBookingFromCustomAPI = async () => {
    try {
      console.log('🚀 Auto-fetching bookings from custom API...');
      
      // Get customer_id from authenticated user
      if (!user || !user.customer_id) {
        console.warn('⚠️ No customer_id available, user not logged in');
        return;
      }
      
      console.log('🔑 Using customer_id:', user.customer_id);
      const response = await getBookingFromCustomAPI(user.customer_id);
      
      console.log('✅ Sample booking fetched from custom API:', response);
      
      // Display the raw API response directly without transformation
      if (response) {
        console.log('🔍 Raw API response for display:', response);
        console.log('🔍 Response fields:', Object.keys(response));
        console.log('🔍 Response type:', typeof response);
        
        // Check if response has nested data structure
        let bookingData = response;
        
        console.log('🔍 Response structure:', {
          hasData: !!response.data,
          dataType: typeof response.data,
          responseKeys: Object.keys(response),
          fullResponse: response
        });
        
        if (response.data) {
          console.log('🔍 Found data field, checking type...');
          console.log('🔍 Data value:', response.data);
          console.log('🔍 Data type:', typeof response.data);
          console.log('🔍 Is data an array?:', Array.isArray(response.data));
          
          // If data is a string, try to parse it as JSON
          if (typeof response.data === 'string') {
            try {
              console.log('🔍 Data is a JSON string, parsing...');
              console.log('🔍 String content:', response.data);
              bookingData = JSON.parse(response.data);
              console.log('✅ Successfully parsed JSON string:', bookingData);
            } catch (e) {
              console.error('❌ Failed to parse JSON string:', e);
              console.error('❌ String that failed:', response.data);
              bookingData = response;
            }
          } else if (Array.isArray(response.data)) {
            console.log('🔍 Data is an array, extracting first element...');
            if (response.data.length > 0) {
              bookingData = response.data[0];
              console.log('✅ Extracted first element from array:', bookingData);
            } else {
              console.log('⚠️ Array is empty');
              bookingData = response;
            }
          } else if (typeof response.data === 'object') {
            console.log('🔍 Data is already an object, using directly');
            bookingData = response.data;
          }
        }
        
        console.log('🔍 Final booking data to display:', bookingData);
        console.log('🔍 Final booking data type:', typeof bookingData);
        console.log('🔍 Final booking data fields:', Object.keys(bookingData));
        console.log('🔍 Final booking data is array?:', Array.isArray(bookingData));
        
        // Store the booking data (either flattened or original)
        setLookedUpBooking(bookingData);
        setLookupError(null);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch sample booking from custom API:', error);
      setLookupError(`Failed to auto-fetch booking BR00666: ${error.message}`);
    }
  };

  // Fetch bookings on component mount and when user data is available
  useEffect(() => {
    // Only fetch if user is authenticated and has customer_id
    if (isAuthenticated && user && user.customer_id) {
      console.log('🔍 Profile page loaded - User authenticated, fetching bookings...');
      console.log('👤 User customer_id:', user.customer_id);
      fetchSampleBookingFromCustomAPI();
    } else {
      console.log('⚠️ Waiting for user authentication...');
      console.log('  - isAuthenticated:', isAuthenticated);
      console.log('  - user:', user);
      console.log('  - customer_id:', user?.customer_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]); // Depend on authentication state and user data

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="w-full py-8 px-6 pt-header-plus-15 max-w-7xl mx-auto"
        style={{
          paddingTop: "calc(var(--header-height-default) + 31px + 14px)",
        }}
      >
        <h1 className="text-3xl font-bold mb-8">{t?.myBookings || "Your Bookings"}</h1>

        <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t?.myBookings || "Your Bookings"}</CardTitle>
                  <Button 
                    onClick={fetchSampleBookingFromCustomAPI} 
                    disabled={isLoadingBookings}
                    size="sm"
                    variant="outline"
                  >
                    {isLoadingBookings ? (
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
                {/* Date Filter */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {t?.filterByDateRange || "Filter by Date Range"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor="fromDate" className="text-xs">{t?.fromDate || "From Date"}</Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="toDate" className="text-xs">{t?.toDate || "To Date"}</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={fetchSampleBookingFromCustomAPI}
                      disabled={isLoadingBookings}
                      className="w-full md:w-auto"
                    >
                      {isLoadingBookings ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CalendarIcon className="h-4 w-4 mr-2" />
                      )}
                      {t?.searchBookings || "Search Bookings"}
                    </Button>
                  </div>
                </div>

                {/* Dynamic API Booking Display */}
                {lookedUpBooking && (
                  <div className="mb-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-lg">
                    {/* Header Section */}
                    <div className="p-6 border-b border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {t?.bookingDetails || "Booking Details"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {lookedUpBooking.status === 'Confirmed' ? (t?.confirmedBooking || 'Confirmed Booking') : 'Custom API Response'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={`px-4 py-2 text-base font-semibold ${
                              lookedUpBooking.status === 'Cancelled' || lookedUpBooking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300'
                                : lookedUpBooking.status === 'Confirmed' || lookedUpBooking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300'
                            }`}
                          >
                            {lookedUpBooking.status || 'Success'}
                          </Badge>
                          {(lookedUpBooking.status === 'Confirmed' || lookedUpBooking.status === 'confirmed') && lookedUpBooking.confirmation_number && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs px-3 py-1.5 h-8"
                              onClick={async () => {
                                try {
                                  console.log('🚫 Cancelling booking with confirmation number:', lookedUpBooking.confirmation_number);
                                  console.log('📋 Booking reference ID:', lookedUpBooking.booking_reference_id);
                                  
                                  // First, cancel with Travzilla API (if needed)
                                  let travzillaCancelSuccess = false;
                                  try {
                                    const travzillaResponse = await fetch('/api/hotel-cancel', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        ConfirmationNumber: lookedUpBooking.confirmation_number
                                      })
                                    });

                                    const travzillaData = await travzillaResponse.json();
                                    console.log('✅ Travzilla Cancel API response:', travzillaData);

                                    if (travzillaResponse.ok && travzillaData.Status && (travzillaData.Status.Code === '200' || travzillaData.Status.Code === '201')) {
                                      travzillaCancelSuccess = true;
                                      console.log('✅ Travzilla cancellation successful');
                                    }
                                  } catch (travzillaError) {
                                    console.warn('⚠️ Travzilla cancellation failed, continuing with custom API:', travzillaError);
                                  }
                                  
                                  // Update status in custom backend API
                                  const cancelPayload = {
                                    booking_reference_id: lookedUpBooking.booking_reference_id,
                                    confirmation_number: lookedUpBooking.confirmation_number,
                                    refund_amount: parseFloat(lookedUpBooking.total_fare || lookedUpBooking.totalFare || 0),
                                    status: 'cancelled'
                                  };
                                  
                                  console.log('📤 Sending cancel request to custom API:', cancelPayload);
                                  
                                  const response = await fetch('/api/bookings/cancel', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(cancelPayload)
                                  });

                                  const data = await response.json();
                                  console.log('✅ Custom Cancel API response:', data);

                                  if (response.ok) {
                                    alert(`✅ Booking cancelled successfully!\nConfirmation: ${lookedUpBooking.confirmation_number}`);
                                    // Refresh the booking data to show updated status
                                    await fetchSampleBookingFromCustomAPI();
                                    // Also refresh the lookup if it's currently displayed
                                    if (lookedUpBooking) {
                                      await handleLookupBooking();
                                    }
                                  } else {
                                    const errorMsg = data.message || data.error || 'Unknown error';
                                    alert(`❌ Failed to cancel booking.\n${errorMsg}`);
                                  }
                                } catch (error) {
                                  console.error('❌ Error cancelling booking:', error);
                                  alert('❌ Failed to cancel booking. Please try again.');
                                }
                              }}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(lookedUpBooking).map(([key, value]) => {
                          // Only skip if value is null, undefined, or a function
                          // Allow empty strings, 0, false, and objects
                          if (value === null || 
                              value === undefined || 
                              typeof value === 'function' ||
                              key.startsWith('_') ||
                              key === 'success') {
                            return null;
                          }

                          // Handle nested objects by stringifying them (but not for display)
                          let displayValue = value;
                          if (typeof value === 'object' && !Array.isArray(value)) {
                            // Skip nested objects for now
                            return null;
                          } else if (Array.isArray(value)) {
                            displayValue = value.join(', ');
                          }

                          // Format the field name for display
                          const displayName = key
                            .replace(/_/g, ' ')
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .trim();

                          // Format the value based on its content
                          
                          // Handle dates (only if it's a string with ISO format)
                          if (typeof displayValue === 'string' && 
                              displayValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                            try {
                              const date = new Date(displayValue);
                              const day = String(date.getDate()).padStart(2, '0');
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const year = String(date.getFullYear()).slice(-2);
                              displayValue = `${day}/${month}/${year}`;
                            } catch (e) {
                              // Keep original value if date parsing fails
                            }
                          }
                          
                          // Handle booleans
                          if (typeof value === 'boolean') {
                            displayValue = value ? '✅ Yes' : '❌ No';
                          }

                          // Handle numbers
                          if (typeof value === 'number') {
                            displayValue = value.toString();
                          }

                          // Determine if this is a key field for special styling
                          const isKeyField = key.toLowerCase().includes('total') || 
                                           key.toLowerCase().includes('fare') || 
                                           key.toLowerCase().includes('amount') ||
                                           key.toLowerCase().includes('price');

                          const isReferenceField = key.toLowerCase().includes('id') || 
                                                  key.toLowerCase().includes('number') || 
                                                  key.toLowerCase().includes('reference') ||
                                                  key.toLowerCase().includes('code');

                          return (
                            <div 
                              key={key} 
                              className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
                                isKeyField ? 'ring-2 ring-green-200 dark:ring-green-800' : ''
                              }`}
                            >
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {displayName}
                              </p>
                              <p className={`font-semibold break-words ${
                                isKeyField 
                                  ? 'text-lg text-green-600 dark:text-green-400' 
                                  : 'text-gray-900 dark:text-white'
                              } ${
                                isReferenceField ? 'font-mono text-sm' : ''
                              }`}>
                                {String(displayValue)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lookup Error */}
                {lookupError && (
                  <div className="mb-6 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded text-sm border border-red-200 dark:border-red-800">
                    {lookupError}
                  </div>
                )}

                {/* Error State */}
                {bookingsError && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
                    <p className="text-sm">{bookingsError}</p>
                  </div>
                )}

                {/* Loading State */}
                {isLoadingBookings && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Loading bookings...</p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingBookings && !bookingsError && bookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t?.noBookingsFound || "No bookings found"}</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        No bookings exist for the selected date range
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Set wider date range (last 6 months to next 6 months)
                        const from = new Date();
                        from.setMonth(from.getMonth() - 6);
                        const to = new Date();
                        to.setMonth(to.getMonth() + 6);
                        setFromDate(from.toISOString().split('T')[0]);
                        setToDate(to.toISOString().split('T')[0]);
                        // Trigger search after state update
                        setTimeout(() => fetchBookings(), 100);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      🔍 Search last 6 months to next 6 months
                    </button>
                  </div>
                )}

                {/* Bookings List */}
                {!isLoadingBookings && !bookingsError && bookings.length > 0 && (
                  <div className="space-y-4">
                    {bookings.map((booking, index) => (
                      <div
                        key={booking.BookingId || index}
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-base">
                                {booking.TripName || booking.HotelName || 'Hotel Booking'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Booking ID: {booking.BookingId} {booking.TBOHotelCode && `• Hotel Code: ${booking.TBOHotelCode}`}
                              </p>
                              {booking.BookingDate && (
                                <p className="text-xs text-muted-foreground">
                                  Booked on: {booking.BookingDate}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                booking.BookingStatus === "Vouchered" || booking.BookingStatus === "Confirmed" || booking.BookingStatus === "Completed"
                                  ? "default"
                                  : booking.BookingStatus === "Cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {booking.BookingStatus || 'Pending'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                            {booking.CheckInDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Check-in</p>
                                <p className="font-medium">{booking.CheckInDate}</p>
                              </div>
                            )}
                            {booking.CheckOutDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Check-out</p>
                                <p className="font-medium">{booking.CheckOutDate}</p>
                              </div>
                            )}
                            {booking.AgencyName && (
                              <div>
                                <p className="text-xs text-muted-foreground">Agency</p>
                                <p className="font-medium">{booking.AgencyName}</p>
                              </div>
                            )}
                            {booking.BookingPrice && (
                              <div>
                                <p className="text-xs text-muted-foreground">Total Amount</p>
                                <p className="font-medium">
                                  {booking.Currency || 'USD'} {booking.BookingPrice}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                            {booking.ConfirmationNo && (
                              <p className="text-muted-foreground">
                                Confirmation: <span className="font-mono font-medium text-foreground">{booking.ConfirmationNo}</span>
                              </p>
                            )}
                            {booking.ClientReferenceNumber && (
                              <p className="text-muted-foreground">
                                Reference: <span className="font-mono font-medium text-foreground">{booking.ClientReferenceNumber}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
