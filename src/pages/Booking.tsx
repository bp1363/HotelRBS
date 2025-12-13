import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Clock, User, Calendar, Users, CreditCard, Wallet } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import CancelModal from "@/components/CancelModal";
import { useAuth } from '@/hooks/useAuth';
import { createTelrOrder } from '@/services/telrPaymentApi';
import { getCurrencySymbol, convertCurrency, EXCHANGE_RATES } from '@/services/currencyConverter';
import { completeBooking } from '@/services/bookingService';
import { addBookingToCustomBackend } from '@/services/bookingsApi';
import { useTranslation } from "@/contexts/TranslationContext";

const Booking = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [prebookData, setPrebookData] = useState<any>(null);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [isPayLaterInProgress, setIsPayLaterInProgress] = useState(false);
  const [hasGuestDetails, setHasGuestDetails] = useState(false);

  // Check if guest details exist
  const checkGuestDetails = () => {
    const savedGuestDetails = localStorage.getItem('guest_details');
    const currentBookingRefId = localStorage.getItem('booking_reference_id');
    
    if (savedGuestDetails && currentBookingRefId) {
      try {
        const guestDetails = JSON.parse(savedGuestDetails);
        const savedBookingRefId = guestDetails.bookingData?.bookingReference?.booking_reference_id;
        
        // Check if booking references match
        if (savedBookingRefId === currentBookingRefId) {
          setHasGuestDetails(true);
          return true;
        } else {
          console.log('🧹 Booking reference mismatch, clearing guest details');
          localStorage.removeItem('guest_details');
          setHasGuestDetails(false);
          return false;
        }
      } catch (error) {
        console.log('🧹 Invalid guest details, clearing');
        localStorage.removeItem('guest_details');
        setHasGuestDetails(false);
        return false;
      }
    }
    
    setHasGuestDetails(false);
    return false;
  };

  useEffect(() => {
    if (location.state?.prebookData) {
      setPrebookData(location.state.prebookData);
    }
    if (location.state?.hotelDetails) {
      setHotelDetails(location.state.hotelDetails);
    }
    
    // Check guest details on mount
    checkGuestDetails();
  }, [location.state]);
  
  // Re-check guest details when modal closes
  useEffect(() => {
    if (!showBookingModal) {
      checkGuestDetails();
    }
  }, [showBookingModal]);

  const handleBookNow = async () => {
    console.log('🎯 Book Now button clicked - Proceeding to Payment!');
    
    // Check if guest details are saved in localStorage
    const savedGuestDetails = localStorage.getItem('guest_details');
    const currentBookingRefId = localStorage.getItem('booking_reference_id');
    
    if (!savedGuestDetails) {
      // No guest details saved, show the booking modal to collect them
      console.log('ℹ️ No guest details found, showing booking modal');
      setShowBookingModal(true);
      return;
    }
    
    // Guest details are saved, proceed to payment
    try {
      const guestDetails = JSON.parse(savedGuestDetails);
      const savedBookingRefId = guestDetails.bookingData?.bookingReference?.booking_reference_id;
      
      console.log('🔍 Comparing booking references:');
      console.log('  - Current:', currentBookingRefId);
      console.log('  - Saved:', savedBookingRefId);
      
      // If booking references don't match, clear old details and show modal
      if (savedBookingRefId !== currentBookingRefId) {
        console.log('⚠️ Booking reference mismatch! Clearing old guest details and showing modal');
        localStorage.removeItem('guest_details');
        setShowBookingModal(true);
        return;
      }
      
      console.log('✅ Guest details found and booking reference matches');
      console.log('💳 Proceeding to payment (booking will be confirmed AFTER payment)');
      
      // Extract data for booking
      const { bookingForm, roomGuests, bookingData: bookingInfo, rooms, guests, selectedRoom } = guestDetails;
      
      // IMPORTANT: Get BookingCode from the correct source
      // The BookingCode should be THE SAME from Search → Room Selection → Prebook → Booking
      console.log('🔍 Extracting BookingCode - checking sources...');
      console.log('📦 location.state?.bookingCode (from HotelDetails):', location.state?.bookingCode);
      console.log('📦 location.state?.selectedRoom:', location.state?.selectedRoom);
      console.log('📦 prebookData?.BookingCode:', prebookData?.BookingCode);
      console.log('📦 selectedRoom (from localStorage):', selectedRoom);
      
      // Priority order for getting BookingCode:
      // 1. From location.state.bookingCode (passed directly from HotelDetails - MOST RELIABLE)
      // 2. From location.state.selectedRoom.BookingCode (the room user selected)
      // 3. From prebookData.BookingCode (set at top level)
      // 4. From selectedRoom.BookingCode (saved in localStorage)
      let bookingCode = location.state?.bookingCode
        || location.state?.selectedRoom?.BookingCode
        || prebookData?.BookingCode 
        || selectedRoom?.BookingCode;
      
      let roomData = selectedRoom || prebookData?.HotelResult?.Rooms;
      
      console.log('🔑 Final BookingCode selected:', bookingCode);
      console.log('📦 Final roomData:', roomData);
      
      // Check if we need to do a fresh prebook (TEST MODE)
      // If the current prebookData is old, do a fresh prebook
      console.log('🔍 Checking if prebook is still valid...');
      
      // If no booking code, we must do prebook
      if (!bookingCode) {
        console.warn('⚠️ No booking code found - prebook may have expired');
        throw new Error('BookingCode not available. The prebook may have expired. Please click "Reserve" again to generate a fresh prebook.');
      }
      
      const totalFare = parseFloat(roomData?.TotalFare || roomData?.Price || 0);
      
      // Set booking in progress
      setIsBookingInProgress(true);

      // IMPORTANT: Telr account only supports AED currency
      // Always use AED for payments regardless of hotel currency
      const currency = 'AED';

      if (totalFare <= 0) {
        throw new Error('Invalid room price. Cannot proceed to payment.');
      }

      // Get booking history for customer details
      const bookingHistory = JSON.parse(localStorage.getItem('booking_history') || '[]');
      const latestBooking = bookingHistory[bookingHistory.length - 1];

      console.log('💰 Creating payment order for amount:', totalFare, currency);
      console.log('ℹ️  Note: Using AED currency as configured in Telr account');

      // Create Telr payment order
      const telrOrder = await createTelrOrder({
        cartId: currentBookingRefId || 'BOOKING_' + Date.now(),
        amount: totalFare.toFixed(2),
        currency: currency,
        description: `Hotel Booking - ${hotelDetails?.HotelName || 'Hotel'}`,
        customer: {
          ref: user?.customer_id || 'guest_' + Date.now(),
          email: bookingForm.email || latestBooking?.customerEmail || user?.email || 'guest@example.com',
          forenames: bookingForm.firstName || latestBooking?.customerName?.split(' ')[0] || 'Guest',
          surname: bookingForm.lastName || latestBooking?.customerName?.split(' ').slice(1).join(' ') || 'User',
          addressLine1: bookingForm.address || latestBooking?.address || '123 Main Street',
          city: bookingForm.city || latestBooking?.city || 'Dubai',
          country: bookingForm.country || 'AE', // ISO country code
          phone: bookingForm.phone || user?.phone || '1234567890'
        },
        returnUrls: {
          authorised: `${window.location.origin}/payment/success`,
          declined: `${window.location.origin}/payment/failure`,
          cancelled: `${window.location.origin}/payment/cancelled`
        }
      });

      console.log('✅ Telr order created:', telrOrder.order.ref);

      // Save Telr order reference and booking data for use after payment
      localStorage.setItem('telr_order_ref', telrOrder.order.ref);
      localStorage.setItem('pending_booking_data', JSON.stringify({
        prebookData,
        hotelDetails,
        checkIn: location.state?.checkIn,
        checkOut: location.state?.checkOut
      }));

      // Redirect to Telr payment page
      console.log('🔗 Redirecting to Telr payment page...');
      console.log('⚠️ Booking will be confirmed ONLY after successful payment');
      window.location.href = telrOrder.order.url;
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      
      // If error is due to invalid guest details or parsing, clear them
      if (error instanceof SyntaxError) {
        console.log('⚠️ Invalid guest details format, clearing...');
        localStorage.removeItem('guest_details');
      }
      
      let errorMessage = error instanceof Error ? error.message : 'Booking failed. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsBookingInProgress(false);
    }
  };

  const handlePayLater = async () => {
    console.log('🎯 Pay Later button clicked - Booking without payment gateway!');
    
    // Check if guest details are saved in localStorage
    const savedGuestDetails = localStorage.getItem('guest_details');
    const currentBookingRefId = localStorage.getItem('booking_reference_id');
    
    if (!savedGuestDetails) {
      // No guest details saved, show the booking modal to collect them
      console.log('ℹ️ No guest details found, showing booking modal');
      setShowBookingModal(true);
      return;
    }
    
    // Guest details are saved, proceed to booking without payment
    try {
      const guestDetails = JSON.parse(savedGuestDetails);
      const savedBookingRefId = guestDetails.bookingData?.bookingReference?.booking_reference_id;
      
      console.log('🔍 Comparing booking references:');
      console.log('  - Current:', currentBookingRefId);
      console.log('  - Saved:', savedBookingRefId);
      
      // If booking references don't match, clear old details and show modal
      if (savedBookingRefId !== currentBookingRefId) {
        console.log('⚠️ Booking reference mismatch! Clearing old guest details and showing modal');
        localStorage.removeItem('guest_details');
        setShowBookingModal(true);
        return;
      }
      
      console.log('✅ Guest details found and booking reference matches');
      console.log('📝 Proceeding to booking (pay later option - no payment gateway)');
      
      // Extract data for booking
      const { bookingForm, roomGuests, bookingData: bookingInfo, rooms, guests, selectedRoom } = guestDetails;
      
      // Get BookingCode from the correct source
      let bookingCode = location.state?.bookingCode
        || location.state?.selectedRoom?.BookingCode
        || prebookData?.BookingCode 
        || selectedRoom?.BookingCode;
      
      let roomData = selectedRoom || prebookData?.HotelResult?.Rooms;
      
      console.log('🔑 Final BookingCode selected:', bookingCode);
      console.log('📦 Final roomData:', roomData);
      
      // If no booking code, we must do prebook
      if (!bookingCode) {
        console.warn('⚠️ No booking code found - prebook may have expired');
        throw new Error('BookingCode not available. The prebook may have expired. Please click "Reserve" again to generate a fresh prebook.');
      }
      
      const totalFare = parseFloat(roomData?.TotalFare || roomData?.Price || 0);
      
      if (totalFare <= 0) {
        throw new Error('Invalid room price. Cannot proceed to booking.');
      }

      // Set booking in progress
      setIsPayLaterInProgress(true);

      console.log('📦 Step 1: Confirming booking with data:', {
        bookingCode,
        bookingReferenceId: bookingInfo.bookingReference.booking_reference_id,
        totalFare,
        paymentMode: 'Pay Later'
      });

      // Call booking API directly (without payment gateway)
      const result = await completeBooking(
        bookingCode,
        bookingInfo.bookingReference.booking_reference_id,
        bookingInfo.customerData,
        bookingForm,
        totalFare,
        rooms,
        guests,
        roomGuests
      );

      if (result.success) {
        console.log('🎉 Booking confirmed successfully (Pay Later)!');
        
        const confirmationData = {
          confirmationNumber: result.confirmationNumber || 'N/A',
          bookingId: result.data?.BookingId || 'N/A',
          clientReferenceId: result.data?.ClientReferenceId || 'N/A',
          bookingReferenceId: bookingInfo.bookingReference.booking_reference_id,
          timestamp: new Date().toISOString(),
          paymentStatus: 'Pending'
        };
        
        // Store booking confirmation
        const fullConfirmation = {
          ...confirmationData,
          payment: {
            status: 'Pending',
            mode: 'Pay Later'
          }
        };
        
        localStorage.setItem('payment_confirmation', JSON.stringify(fullConfirmation));
        
        // Save to booking history
        const bookingHistory = JSON.parse(localStorage.getItem('booking_history') || '[]');
        bookingHistory.push({
          ...confirmationData,
          hotelName: hotelDetails?.HotelName || 'Unknown Hotel',
          roomName: roomData?.Name || 'Unknown Room',
          totalAmount: totalFare,
          customerEmail: bookingForm.email,
          customerName: `${bookingForm.firstName} ${bookingForm.lastName}`,
          paymentStatus: 'Pending'
        });
        localStorage.setItem('booking_history', JSON.stringify(bookingHistory));
        
        // Add to custom backend
        try {
          console.log('📝 Storing booking in custom backend...');
          const userData = JSON.parse(localStorage.getItem('userData') || 'null');
          await addBookingToCustomBackend({
            booking_reference_id: confirmationData.bookingReferenceId,
            confirmation_number: confirmationData.confirmationNumber,
            client_reference_id: confirmationData.clientReferenceId,
            customer_id: userData?.customer_id || '',
            agency_name: 'TravelPro',
            hotel_code: hotelDetails?.HotelCode || '',
            check_in: location.state?.checkIn || new Date().toISOString().split('T')[0],
            check_out: location.state?.checkOut || new Date().toISOString().split('T')[0],
            booking_date: new Date().toISOString(),
            status: 'Confirmed',
            voucher_status: true,
            total_fare: totalFare,
            currency: prebookData?.HotelResult?.Currency || 'USD',
            no_of_rooms: rooms,
            invoice_number: `INV${Date.now()}`
          });
          console.log('✅ Booking stored in custom backend successfully');
        } catch (backendError) {
          console.error('⚠️ Failed to store in custom backend (non-critical):', backendError);
        }
        
        // Clean up - clear used data
        localStorage.removeItem('guest_details');
        localStorage.removeItem('booking_reference_id');
        
        console.log('🎉 ======= BOOKING COMPLETE (PAY LATER) =======');
        console.log('📋 Confirmation Number:', confirmationData.confirmationNumber);
        console.log('🆔 Booking ID:', confirmationData.bookingId);
        console.log('💳 Payment Status: Pending (Pay Later)');
        console.log('==========================================');
        
        // Navigate to a success page or show success message
        // For now, we'll navigate to payment success page but with a different message
        navigate(`/payment/success?booking_ref=${confirmationData.bookingReferenceId}&pay_later=true`, {
          state: {
            confirmationData,
            paymentMode: 'Pay Later',
            bookingConfirmed: true
          }
        });
        
      } else {
        throw new Error(`Booking confirmation failed: ${result.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ Pay Later booking error:', error);
      
      // If error is due to invalid guest details or parsing, clear them
      if (error instanceof SyntaxError) {
        console.log('⚠️ Invalid guest details format, clearing...');
        localStorage.removeItem('guest_details');
      }
      
      let errorMessage = error instanceof Error ? error.message : 'Booking failed. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsPayLaterInProgress(false);
    }
  };

  // Debug cancellation policies
  console.log('🔍 Prebooking Data:', prebookData);
  console.log('🔍 HotelResult:', prebookData?.HotelResult);
  console.log('🔍 Rooms:', prebookData?.HotelResult?.Rooms);
  console.log('🔍 CancelPolicies path 1:', prebookData?.HotelResult?.Rooms?.CancelPolicies);
  console.log('🔍 CancelPolicies path 2:', prebookData?.HotelResult?.CancelPolicies);
  console.log('🔍 CancelPolicies path 3:', prebookData?.CancelPolicies);

  if (!prebookData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground">No prebooking data found</p>
              <Button onClick={() => navigate(-1)} className="mt-4">
                Go Back
              </Button>
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
      
      <main className="container mx-auto px-4 py-8 mt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t?.backToHotel || "Back to Hotel Details"}
        </Button>

        {/* Warning Message */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            ⚠️ <strong>Important:</strong> The booking would be cancelled after 24 hours if payment is not completed.
          </AlertDescription>
        </Alert>

        {/* Top Row - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
          {/* Left Column - Cancellation Policies & Amenities */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Cancellation Policies Card */}
            {(() => {
              // Try multiple paths to find cancellation policies
              let rawCancelPolicies = 
                prebookData.HotelResult?.Rooms?.CancelPolicies || 
                prebookData.HotelResult?.CancelPolicies ||
                prebookData?.CancelPolicies;
              
              console.log('🔍 Found CancelPolicies:', rawCancelPolicies);
              console.log('🔍 Is Array?', Array.isArray(rawCancelPolicies));
              console.log('🔍 Type:', typeof rawCancelPolicies);
              
              if (!rawCancelPolicies) {
                console.log('❌ No cancellation policies found in any path');
                return null;
              }
              
              // Convert single object to array
              let cancelPolicies: any[];
              if (Array.isArray(rawCancelPolicies)) {
                cancelPolicies = rawCancelPolicies;
                console.log('✅ CancelPolicies is already an array');
              } else if (typeof rawCancelPolicies === 'object') {
                cancelPolicies = [rawCancelPolicies];
                console.log('✅ Converted single CancelPolicies object to array');
              } else {
                console.log('❌ CancelPolicies is not an array or object:', typeof rawCancelPolicies);
                return null;
              }
              
              if (cancelPolicies.length === 0) {
                console.log('❌ CancelPolicies array is empty');
                return null;
              }
              
              console.log('✅ Displaying', cancelPolicies.length, 'cancellation policies');
              
              return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base sm:text-lg">Cancellation Policies</span>
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                      {cancelPolicies.length} {cancelPolicies.length === 1 ? 'Policy' : 'Policies'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('🏨 Total Cancellation Policies:', cancelPolicies.length);
                    console.log('📋 All Policies:', JSON.stringify(cancelPolicies, null, 2));
                    return null;
                  })()}
                  
                  <div className="space-y-4">
                    {cancelPolicies.map((policy: any, index: number) => {
                      console.log(`🔍 Policy #${index + 1}:`, JSON.stringify(policy, null, 2));
                      
                      // Format date properly
                      const formatDate = (dateStr: string) => {
                        try {
                          const date = new Date(dateStr);
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = String(date.getFullYear()).slice(-2);
                          return `${day}/${month}/${year}`;
                        } catch (e) {
                          return dateStr;
                        }
                      };
                      
                      // Get all keys from policy object to display everything
                      const policyKeys = Object.keys(policy);
                      console.log(`📋 Policy #${index + 1} keys:`, policyKeys);
                      
                      const totalFields = Object.keys(policy).length;
                      const nonEmptyFields = Object.entries(policy).filter(([_, value]) => 
                        value !== null && value !== undefined && value !== ''
                      ).length;
                      
                      return (
                        <div 
                          key={index} 
                          className="relative p-3 sm:p-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200"
                        >
                          {/* Policy Number Badge */}
                          <div className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 bg-primary text-white font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full shadow-md">
                            Policy #{index + 1}
                          </div>
                          
                          {/* Field Count Badge */}
                          <div className="mb-3 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                            📋 {nonEmptyFields} field{nonEmptyFields !== 1 ? 's' : ''} available
                          </div>
                          
                          <div className="mt-2 space-y-2 sm:space-y-3">
                            {/* Display ALL fields from policy object */}
                            {Object.entries(policy).map(([key, value]) => {
                              // Format the key for display
                              const formattedKey = key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, (str) => str.toUpperCase())
                                .trim();
                              
                              // Check if value is empty
                              const isEmpty = value === null || value === undefined || value === '';
                              
                              if (isEmpty) {
                                console.log(`⚠️ Empty field: ${key}`);
                              }
                              
                              // Format the value
                              let formattedValue: any = value;
                              if (isEmpty) {
                                formattedValue = '—'; // Show dash for empty values
                              } else if (key.toLowerCase().includes('date')) {
                                formattedValue = formatDate(value as string);
                              } else if (typeof value === 'object') {
                                formattedValue = JSON.stringify(value, null, 2);
                              } else {
                                formattedValue = String(value);
                              }
                              
                              // Determine if value should be highlighted (charges, fees)
                              const isCharge = !isEmpty && (
                                key.toLowerCase().includes('charge') || 
                                key.toLowerCase().includes('fee') ||
                                key.toLowerCase().includes('penalty') ||
                                key.toLowerCase().includes('amount')
                              );
                              
                              // Convert charge amounts from USD to preferred currency
                              if (isCharge && !isEmpty && typeof value === 'number' && prebookData.HotelResult?.Currency) {
                                const currency = prebookData.HotelResult.Currency;
                                if (currency !== 'USD') {
                                  const convertedAmount = convertCurrency(value, currency);
                                  formattedValue = `${getCurrencySymbol(currency)} ${convertedAmount.toFixed(2)}`;
                                } else {
                                  formattedValue = `${getCurrencySymbol('USD')} ${value.toFixed(2)}`;
                                }
                              } else if (isCharge && !isEmpty && typeof value === 'string') {
                                // Try to parse string as number
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue) && prebookData.HotelResult?.Currency) {
                                  const currency = prebookData.HotelResult.Currency;
                                  if (currency !== 'USD') {
                                    const convertedAmount = convertCurrency(numValue, currency);
                                    formattedValue = `${getCurrencySymbol(currency)} ${convertedAmount.toFixed(2)}`;
                                  } else {
                                    formattedValue = `${getCurrencySymbol('USD')} ${numValue.toFixed(2)}`;
                                  }
                                }
                              }
                              
                              console.log(`${isEmpty ? '⚠️' : '✅'} ${isEmpty ? 'Empty' : 'Displaying'} field: ${key} = ${formattedValue}`);
                              
                              return (
                                <div key={key} className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b border-gray-200 last:border-0 ${isEmpty ? 'opacity-50' : ''}`}>
                                  <span className="font-semibold text-gray-700 text-xs sm:text-sm sm:min-w-[140px]">
                                    {formattedKey}:
                                  </span>
                                  <span className={`text-xs sm:text-sm break-words ${isCharge ? "text-red-600 font-bold sm:text-base" : isEmpty ? "text-gray-500 italic" : "text-gray-900 font-medium"}`}>
                                    {formattedValue}
                                  </span>
                                </div>
                              );
                            })}
                            
                            {/* Show message if policy object is completely empty */}
                            {Object.keys(policy).length === 0 && (
                              <div className="text-xs sm:text-sm text-muted-foreground italic p-4 text-center bg-yellow-50 rounded-lg">
                                ⚠️ No policy details available
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Additional info */}
                  <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                      <strong className="font-semibold">⚠️ Important:</strong> Cancellation charges may apply based on the dates shown above. Please review each policy carefully before booking.
                    </p>
                  </div>
                </CardContent>
              </Card>
              );
            })()}

            {/* Room Amenities Card */}
            {prebookData.HotelResult?.Rooms?.Amenities && prebookData.HotelResult.Rooms.Amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Room Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prebookData.HotelResult.Rooms.Amenities.map((amenity: string, index: number) => (
                      <span key={index} className="px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 text-primary text-xs sm:text-sm rounded-full font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            {/* Booking Summary Card */}
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-muted-foreground text-xs sm:text-sm">{t?.hotelName || "Hotel"}</span>
                    <span className="font-medium text-xs sm:text-sm text-right">{hotelDetails?.HotelName || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs sm:text-sm">{t?.checkIn || "Check-in"}</span>
                    <span className="font-medium text-xs sm:text-sm">{location.state?.checkIn || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs sm:text-sm">{t?.checkOut || "Check-out"}</span>
                    <span className="font-medium text-xs sm:text-sm">{location.state?.checkOut || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-muted-foreground text-xs sm:text-sm">Room Type</span>
                    <span className="font-medium text-xs sm:text-sm text-right">{prebookData.HotelResult?.Rooms?.Name || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs sm:text-sm">Meal Type</span>
                    <span className="font-medium text-xs sm:text-sm">{prebookData.HotelResult?.Rooms?.MealType || "N/A"}</span>
                  </div>
                  
                  <hr />
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground text-sm sm:text-base font-medium">{t?.totalAmount || "Total Amount"}</span>
                    <span className="font-bold text-base sm:text-lg text-primary">
                      {getCurrencySymbol(prebookData.HotelResult?.Currency || 'AED')} {typeof prebookData.HotelResult?.Rooms?.TotalFare === 'number' ? prebookData.HotelResult?.Rooms?.TotalFare.toFixed(2) : parseFloat(prebookData.HotelResult?.Rooms?.TotalFare || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 mt-4 sm:mt-6">
                    {!hasGuestDetails ? (
                      <>
                        <Button 
                          size="lg" 
                          className="w-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setShowBookingModal(true)}
                        >
                          <User className="mr-2 h-5 w-5" />
                          Give Details
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          📝 Fill in your guest details to proceed
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Option 1: Proceed to Payment */}
                        <Button 
                          size="lg" 
                          className="w-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                          onClick={handleBookNow}
                          disabled={isBookingInProgress || isPayLaterInProgress}
                        >
                          {isBookingInProgress ? (
                            <>
                              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-5 w-5" />
                              Proceed to Payment
                            </>
                          )}
                        </Button>
                        
                        {/* Divider */}
                        <div className="flex items-center gap-2 my-1">
                          <div className="flex-1 border-t border-gray-300"></div>
                          <span className="text-xs text-muted-foreground">OR</span>
                          <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        
                        {/* Option 2: Pay Later */}
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="w-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base border-2 border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={handlePayLater}
                          disabled={isBookingInProgress || isPayLaterInProgress}
                        >
                          {isPayLaterInProgress ? (
                            <>
                              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-2 h-5 w-5" />
                              {t?.payLater || "Pay Later"} & {t?.bookNow || "Book Now"}
                            </>
                          )}
                        </Button>
                        
                        {/* Info Messages */}
                        <div className="space-y-1 mt-2">
                          <p className="text-xs text-center text-muted-foreground">
                            💳 Option 1: You will be redirected to secure payment gateway
                          </p>
                          <p className="text-xs text-center text-blue-600 font-medium">
                            💰 Option 2: Book now and pay later (payment pending)
                          </p>
                          <p className="text-xs text-center text-orange-600 font-medium">
                            ⚠️ Booking will be confirmed immediately with Pay Later option
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Important Information (Full Width) */}
        {prebookData.HotelResult?.RateConditions && prebookData.HotelResult.RateConditions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm max-h-96 overflow-y-auto">
                {prebookData.HotelResult.RateConditions.map((condition: string, index: number) => {
                  // Decode HTML entities
                  const decoded = condition
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"');
                  
                  return (
                    <div key={index} className="pb-2 sm:pb-3 border-b border-gray-200 last:border-0">
                      <div dangerouslySetInnerHTML={{ __html: decoded }} className="prose prose-sm max-w-none text-gray-700 [&>*]:text-xs [&>*]:sm:text-sm" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setShowBookingModal(false)}
        >
          <div 
            className="bg-background rounded-lg max-w-4xl w-full my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <BookingModal 
              hotelDetails={hotelDetails}
              selectedRoom={location.state?.selectedRoom || {
                ...prebookData?.HotelResult?.Rooms,
                BookingCode: location.state?.bookingCode || prebookData?.BookingCode
              }}
              rooms={location.state?.rooms}
              guests={location.state?.guests}
              adults={location.state?.adults}
              children={location.state?.children}
              childrenAges={location.state?.childrenAges}
              roomGuestsDistribution={location.state?.roomGuests}
              onClose={() => setShowBookingModal(false)}
            />
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setShowCancelModal(false)}
        >
          <div 
            className="bg-background rounded-lg max-w-md w-full animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <CancelModal 
              hotelName={hotelDetails?.HotelName}
              bookingReference={location.state?.bookingCode}
              onClose={() => setShowCancelModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
// /Users/apple/Downloads/NEWFLOW/src/pages/Booking.tsx