import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Users, Minus, Plus, X } from "lucide-react";
import { formatDateDDMMYY } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RoomGuests {
  adults: number;
  children: number;
  childrenAges: number[];
}

interface AvailabilitySectionProps {
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
  rooms: number;
  childrenAges?: number[];
  onSearchChange: (params: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    childrenAges?: number[];
    roomGuests?: RoomGuests[];
  }) => void;
  isLoading?: boolean;
}

export const AvailabilitySection = ({
  checkIn,
  checkOut,
  adults,
  children,
  rooms,
  childrenAges = [],
  onSearchChange,
  isLoading = false,
}: AvailabilitySectionProps) => {
  // Parse dates or use defaults
  const parseDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(parseDate(checkIn));
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(parseDate(checkOut));
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  
  // Initialize room guests - per room configuration
  const initializeRoomGuests = (): RoomGuests[] => {
    const roomsArray: RoomGuests[] = [];
    const adultsPerRoom = Math.floor(adults / rooms);
    const childrenPerRoom = Math.floor(children / rooms);
    
    for (let i = 0; i < rooms; i++) {
      const isLastRoom = i === rooms - 1;
      const roomAdults = isLastRoom ? adults - (adultsPerRoom * (rooms - 1)) : adultsPerRoom;
      const roomChildren = isLastRoom ? children - (childrenPerRoom * (rooms - 1)) : childrenPerRoom;
      
      const startIdx = i * childrenPerRoom;
      const endIdx = isLastRoom ? childrenAges.length : startIdx + childrenPerRoom;
      const roomChildrenAges = childrenAges.slice(startIdx, endIdx);
      
      roomsArray.push({
        adults: Math.max(1, roomAdults),
        children: roomChildren,
        childrenAges: roomChildrenAges.length === roomChildren ? roomChildrenAges : Array(roomChildren).fill(5)
      });
    }
    
    return roomsArray;
  };
  
  const [roomGuests, setRoomGuests] = useState<RoomGuests[]>(initializeRoomGuests());

  // Update room guests when rooms count changes
  useEffect(() => {
    setRoomGuests(initializeRoomGuests());
  }, []);

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
    const oldCount = updated[roomIndex].children;
    updated[roomIndex].children = Math.max(0, Math.min(5, children));
    
    // Adjust children ages array
    if (children > oldCount) {
      // Add default ages for new children
      for (let i = oldCount; i < children; i++) {
        updated[roomIndex].childrenAges.push(5);
      }
    } else {
      // Remove ages for removed children
      updated[roomIndex].childrenAges = updated[roomIndex].childrenAges.slice(0, children);
    }
    
    setRoomGuests(updated);
  };

  const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
    const updated = [...roomGuests];
    updated[roomIndex].childrenAges[childIndex] = age;
    setRoomGuests(updated);
  };

  const handleChangeSearch = () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates");
      return;
    }

    // Calculate totals from room guests
    const totalAdults = roomGuests.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = roomGuests.reduce((sum, room) => sum + room.children, 0);
    const allChildrenAges = roomGuests.flatMap(room => room.childrenAges);

    const params = {
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
      adults: totalAdults,
      children: totalChildren,
      rooms: roomGuests.length,
      childrenAges: allChildrenAges,
      roomGuests: roomGuests,
    };

    onSearchChange(params);
    setShowGuestPicker(false);
  };

  const formatDateRange = () => {
    if (!checkInDate || !checkOutDate) return "Select dates";
    const checkin = formatDateDDMMYY(checkInDate);
    const checkout = formatDateDDMMYY(checkOutDate);
    return `${checkin} — ${checkout}`;
  };

  const formatGuests = () => {
    const totalAdults = roomGuests.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = roomGuests.reduce((sum, room) => sum + room.children, 0);
    const parts = [];
    if (totalAdults > 0) parts.push(`${totalAdults} adult${totalAdults !== 1 ? 's' : ''}`);
    if (totalChildren > 0) parts.push(`${totalChildren} child${totalChildren !== 1 ? 'ren' : ''}`);
    parts.push(`${roomGuests.length} room${roomGuests.length !== 1 ? 's' : ''}`);
    return parts.join(' · ');
  };

  return (
    <Card className="sticky-search-bar mb-8 border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-lg z-40">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-foreground">
            Change Search Parameters
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Date Picker */}
          <div className="flex-1 w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 border-2",
                    !checkInDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-3 border-r">
                    <Label className="text-xs mb-2 block">Check-in</Label>
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => {
                        setCheckInDate(date);
                        // If check-out is before or same as new check-in, reset it
                        if (date && checkOutDate && checkOutDate <= date) {
                          const nextDay = new Date(date);
                          nextDay.setDate(nextDay.getDate() + 1);
                          setCheckOutDate(nextDay);
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </div>
                  <div className="p-3">
                    <Label className="text-xs mb-2 block">Check-out</Label>
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // If no check-in selected, disable dates before tomorrow
                        if (!checkInDate) {
                          const tomorrow = new Date(today);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return date < tomorrow;
                        }
                        
                        // If check-in selected, disable dates on or before check-in
                        const checkInDay = new Date(checkInDate);
                        checkInDay.setHours(0, 0, 0, 0);
                        return date <= checkInDay;
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Guest Selector */}
          <div className="flex-1 w-full md:w-auto">
            <Dialog open={showGuestPicker} onOpenChange={setShowGuestPicker}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12 border-2"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {formatGuests()}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Guests & Rooms</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Room-by-Room Configuration */}
                  {roomGuests.map((room, roomIndex) => (
                    <div key={roomIndex} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Room {roomIndex + 1}</Label>
                        {roomGuests.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoom(roomIndex)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Adults per room */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Adults</Label>
                          <p className="text-xs text-muted-foreground">Age 13+</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateRoomAdults(roomIndex, room.adults - 1)}
                            disabled={room.adults <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{room.adults}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateRoomAdults(roomIndex, room.adults + 1)}
                            disabled={room.adults >= 10}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Children per room */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Children</Label>
                          <p className="text-xs text-muted-foreground">Age 0-12</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateRoomChildren(roomIndex, room.children - 1)}
                            disabled={room.children <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{room.children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateRoomChildren(roomIndex, room.children + 1)}
                            disabled={room.children >= 5}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Children Ages for this room */}
                      {room.children > 0 && (
                        <div className="space-y-2 p-3 bg-background rounded-md">
                          <Label className="text-xs font-medium">Children's Ages</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: room.children }).map((_, childIndex) => (
                              <div key={childIndex} className="flex flex-col space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Child {childIndex + 1}
                                </Label>
                                <select
                                  value={room.childrenAges[childIndex] || 5}
                                  onChange={(e) => updateChildAge(roomIndex, childIndex, parseInt(e.target.value))}
                                  className="w-full px-2 py-1.5 border rounded-md text-xs"
                                >
                                  {Array.from({ length: 13 }, (_, i) => (
                                    <option key={i} value={i}>
                                      {i} {i === 1 ? 'year' : 'years'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Room Button */}
                  {roomGuests.length < 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={addRoom}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Room
                    </Button>
                  )}

                  {/* Apply Button */}
                  <Button 
                    onClick={handleChangeSearch} 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isLoading}
                  >
                    Apply
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Change Search Button */}
          <Button 
            onClick={handleChangeSearch}
            className="bg-primary hover:bg-primary/90 text-white h-12 px-8 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Update Search"}
          </Button>
        </div>

        {checkInDate && checkOutDate && (
          <div className="flex items-center gap-2 mt-3">
            <div className="h-1 w-1 rounded-full bg-muted-foreground/50"></div>
            <p className="text-sm text-muted-foreground">
              {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} night
              {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

