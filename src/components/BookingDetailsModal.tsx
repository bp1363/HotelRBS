import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { formatDateDDMMYY } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingDetails: BookingDetails) => void;
  hotelName: string;
}

export interface BookingDetails {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  childrenAges: number[];
  roomGuests: Array<{
    adults: number;
    children: number;
    childrenAges: number[];
  }>;
}

const BookingDetailsModal = ({ isOpen, onClose, onConfirm, hotelName }: BookingDetailsModalProps) => {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [roomGuests, setRoomGuests] = useState<Array<{
    adults: number;
    children: number;
    childrenAges: number[];
  }>>([{ adults: 2, children: 0, childrenAges: [] }]);
  const [isCheckInCalendarOpen, setIsCheckInCalendarOpen] = useState(false);
  const [isCheckOutCalendarOpen, setIsCheckOutCalendarOpen] = useState(false);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle check-in date selection and close calendar
  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    setIsCheckInCalendarOpen(false);
  };

  // Handle check-out date selection and close calendar
  const handleCheckOutSelect = (date: Date | undefined) => {
    setCheckOut(date);
    setIsCheckOutCalendarOpen(false);
  };

  // Handle room guest changes
  const handleRoomGuestChange = (roomIndex: number, field: 'adults' | 'children', value: number) => {
    const newRoomGuests = [...roomGuests];
    newRoomGuests[roomIndex] = { ...newRoomGuests[roomIndex], [field]: value };
    setRoomGuests(newRoomGuests);
    
    // Update total counts
    const totalAdults = newRoomGuests.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = newRoomGuests.reduce((sum, room) => sum + room.children, 0);
    setAdults(totalAdults);
    setChildren(totalChildren);
  };

  const handleRoomChildAgeChange = (roomIndex: number, childIndex: number, age: number) => {
    const newRoomGuests = [...roomGuests];
    const newChildrenAges = [...(newRoomGuests[roomIndex].childrenAges || [])];
    newChildrenAges[childIndex] = age;
    newRoomGuests[roomIndex] = { ...newRoomGuests[roomIndex], childrenAges: newChildrenAges };
    setRoomGuests(newRoomGuests);
  };

  // Handle rooms change
  const handleRoomsChange = (newRooms: number) => {
    if (newRooms < rooms) {
      // Remove rooms
      const newRoomGuests = roomGuests.slice(0, newRooms);
      setRoomGuests(newRoomGuests);
    } else {
      // Add rooms
      const newRoomGuests = [...roomGuests];
      for (let i = rooms; i < newRooms; i++) {
        newRoomGuests.push({ adults: 1, children: 0, childrenAges: [] });
      }
      setRoomGuests(newRoomGuests);
    }
    setRooms(newRooms);
  };

  const handleConfirm = () => {
    if (!checkIn || !checkOut) return;

    // Validate dates
    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date");
      return;
    }

    // Collect all children ages from all rooms
    const allChildrenAges = roomGuests.flatMap(room => room.childrenAges);

    const bookingDetails: BookingDetails = {
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      adults,
      children,
      rooms,
      childrenAges: allChildrenAges,
      roomGuests,
    };

    onConfirm(bookingDetails);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Booking Details for {hotelName}</DialogTitle>
          <DialogDescription>
            Please provide your check-in/check-out dates and guest information to view availability and pricing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in Date</Label>
              <Popover open={isCheckInCalendarOpen} onOpenChange={setIsCheckInCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? formatDateDDMMYY(checkIn) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={handleCheckInSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out Date</Label>
              <Popover open={isCheckOutCalendarOpen} onOpenChange={setIsCheckOutCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? formatDateDDMMYY(checkOut) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={handleCheckOutSelect}
                    disabled={(date) => !checkIn || date <= checkIn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Rooms Selector */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Rooms</Label>
              <p className="text-sm text-muted-foreground">Number of rooms</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRoomsChange(Math.max(1, rooms - 1))}
                disabled={rooms <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{rooms}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRoomsChange(rooms + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Room Details */}
          <div className="space-y-4">
            <Label>Room Details</Label>
            
            {/* Room 1 - Always show */}
            <div className="p-4 bg-primary/5 rounded-lg space-y-4">
              <div className="font-medium text-primary">Room 1</div>
              
              {/* Adults for Room 1 */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Adults</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRoomGuestChange(0, 'adults', Math.max(1, (roomGuests[0]?.adults || 1) - 1))}
                    disabled={(roomGuests[0]?.adults || 1) <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{roomGuests[0]?.adults || 1}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRoomGuestChange(0, 'adults', (roomGuests[0]?.adults || 1) + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Children for Room 1 */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Children</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRoomGuestChange(0, 'children', Math.max(0, (roomGuests[0]?.children || 0) - 1))}
                    disabled={(roomGuests[0]?.children || 0) <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{roomGuests[0]?.children || 0}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRoomGuestChange(0, 'children', (roomGuests[0]?.children || 0) + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Children ages for Room 1 */}
              {(roomGuests[0]?.children || 0) > 0 && (
                <div className="space-y-2 pt-2 border-t border-primary/20">
                  <div className="text-sm font-medium text-muted-foreground">Children Ages</div>
                  {Array.from({ length: roomGuests[0]?.children || 0 }).map((_, childIndex) => (
                    <div key={childIndex} className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">
                        Age {childIndex + 1}
                      </Label>
                      <select
                        value={roomGuests[0]?.childrenAges?.[childIndex] || 0}
                        onChange={(e) => handleRoomChildAgeChange(0, childIndex, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value={0}>Age</option>
                        {Array.from({ length: 11 }, (_, i) => i + 2).map((age) => (
                          <option key={age} value={age}>
                            {age}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Rooms (Room 2, Room 3, etc.) */}
            {rooms > 1 && (
              <div className="space-y-3">
                {Array.from({ length: rooms - 1 }).map((_, index) => {
                  const roomIndex = index + 1; // Start from Room 2
                  return (
                    <div key={roomIndex} className="p-4 bg-muted/30 rounded-lg space-y-4">
                      <div className="font-medium text-primary">Room {roomIndex + 1}</div>
                      
                      {/* Adults per room */}
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Adults</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRoomGuestChange(roomIndex, 'adults', Math.max(1, (roomGuests[roomIndex]?.adults || 1) - 1))}
                            disabled={(roomGuests[roomIndex]?.adults || 1) <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{roomGuests[roomIndex]?.adults || 1}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRoomGuestChange(roomIndex, 'adults', (roomGuests[roomIndex]?.adults || 1) + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Children per room */}
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Children</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRoomGuestChange(roomIndex, 'children', Math.max(0, (roomGuests[roomIndex]?.children || 0) - 1))}
                            disabled={(roomGuests[roomIndex]?.children || 0) <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{roomGuests[roomIndex]?.children || 0}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRoomGuestChange(roomIndex, 'children', (roomGuests[roomIndex]?.children || 0) + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Children ages per room */}
                      {(roomGuests[roomIndex]?.children || 0) > 0 && (
                        <div className="space-y-2 pt-2 border-t border-muted">
                          <div className="text-sm font-medium text-muted-foreground">Children Ages</div>
                          {Array.from({ length: roomGuests[roomIndex]?.children || 0 }).map((_, childIndex) => (
                            <div key={childIndex} className="flex items-center justify-between">
                              <Label className="text-sm text-muted-foreground">
                                Age {childIndex + 1}
                              </Label>
                              <select
                                value={roomGuests[roomIndex]?.childrenAges?.[childIndex] || 0}
                                onChange={(e) => handleRoomChildAgeChange(roomIndex, childIndex, parseInt(e.target.value))}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value={0}>Age</option>
                                {Array.from({ length: 11 }, (_, i) => i + 2).map((age) => (
                                  <option key={age} value={age}>
                                    {age}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            View Hotel Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
