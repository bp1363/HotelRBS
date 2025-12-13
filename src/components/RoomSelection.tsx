import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HotelResult } from '@/services/hotelApi';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SelectedRoomInfo {
  bookingCode: string;
  roomDetails: any;
  roomIndex: number;
  selectionId: string; // Unique ID for each selection
}

interface RoomSelectionProps {
  hotel: HotelResult;
  onRoomSelect: (selectedRooms: SelectedRoomInfo[]) => void;
  unavailableRooms?: string[]; // Booking codes of rooms that failed prebook
}

const RoomSelection: React.FC<RoomSelectionProps> = ({ hotel, onRoomSelect, unavailableRooms = [] }) => {
  const [searchParams] = useSearchParams();
  const maxRooms = parseInt(searchParams.get('rooms') || '1');
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoomInfo[]>([]);

  // Notify parent when selection changes
  useEffect(() => {
    onRoomSelect(selectedRooms);
  }, [selectedRooms]);

  const handleRoomSelect = (bookingCode: string, roomDetails: any, roomIndex: number) => {
    // Check if we can add more rooms
    if (selectedRooms.length < maxRooms) {
      // Generate unique selection ID
      const selectionId = `${bookingCode}-${roomIndex}-${Date.now()}`;
      setSelectedRooms([...selectedRooms, { bookingCode, roomDetails, roomIndex, selectionId }]);
    }
  };

  const handleRoomDeselect = (selectionId: string) => {
    setSelectedRooms(selectedRooms.filter(r => r.selectionId !== selectionId));
  };

  const getSelectedCount = (bookingCode: string, roomIndex: number) => {
    return selectedRooms.filter(r => r.bookingCode === bookingCode && r.roomIndex === roomIndex).length;
  };

  const isRoomSelected = (bookingCode: string, roomIndex: number) => {
    return getSelectedCount(bookingCode, roomIndex) > 0;
  };

  const isRoomUnavailable = (bookingCode: string) => {
    return unavailableRooms.includes(bookingCode);
  };

  // If no rooms data, show a message
  if (!hotel.Rooms || hotel.Rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Rooms Available</CardTitle>
          <CardDescription>
            No room information available for this hotel. You may need to contact the hotel directly.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Rooms ({selectedRooms.length}/{maxRooms})</CardTitle>
          <CardDescription>
            Choose up to {maxRooms} room{maxRooms > 1 ? 's' : ''} for {hotel.HotelName}
          </CardDescription>
          {unavailableRooms.length > 0 && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">Some rooms are no longer available</p>
                <p className="text-xs mt-1">Please select different rooms to continue with your booking.</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {hotel.Rooms.map((room, index) => {
            const bookingCode = room.BookingCode || `room-${index}`;
            const selectedCount = getSelectedCount(bookingCode, index);
            const isSelected = selectedCount > 0;
            const isUnavailable = isRoomUnavailable(bookingCode);
            const canSelect = selectedRooms.length < maxRooms;
            
            return (
              <Card 
                key={index} 
                className={`transition-all ${
                  isUnavailable 
                    ? 'opacity-50 cursor-not-allowed bg-red-50 border-red-200' 
                    : isSelected
                      ? 'ring-2 ring-green-500 bg-green-50 cursor-pointer' 
                      : canSelect
                        ? 'hover:shadow-md cursor-pointer'
                        : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => !isUnavailable && canSelect && handleRoomSelect(bookingCode, room, index)}
              >
              <CardContent className="p-4">
                {isUnavailable && (
                  <div className="mb-2 flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">This room is no longer available</span>
                  </div>
                )}
                {isSelected && !isUnavailable && (
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-semibold">Selected ({selectedCount})</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Click to add more
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {room.RoomType || `Room ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {room.MealType || 'Meal type not specified'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {/* Refundable badge hidden as per requirements */}
                      {room.CancellationPolicy && (
                        <Badge variant="outline">Free Cancellation</Badge>
                      )}
                    </div>
                    {room.CancellationPolicy && (
                      <p className="text-xs text-gray-500">
                        {room.CancellationPolicy}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {room.Currency} {room.Price || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">per night</div>
                  </div>
                </div>
                {room.BookingCode && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                    Booking Code: {room.BookingCode}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomSelection;
