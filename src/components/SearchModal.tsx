import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, MapPin } from "lucide-react";
import { NATIONALITIES, DEFAULT_NATIONALITY } from "@/config/nationalities";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/config/currencies";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestination?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, defaultDestination = "" }) => {
  const navigate = useNavigate();
  
  // Set default dates (1 week from now, 3 days stay)
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() + 7);
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 10);
  
  const [destination, setDestination] = useState(defaultDestination);
  const [startDate, setStartDate] = useState<string>(
    defaultStartDate.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    defaultEndDate.toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [roomGuests, setRoomGuests] = useState<Array<{
    adults: number;
    children: number;
    childrenAges: number[];
  }>>([{ adults: 2, children: 0, childrenAges: [] }]);
  
  // Nationality and Currency State
  const [nationality, setNationality] = useState<string>(() => {
    return localStorage.getItem("selectedNationality") || DEFAULT_NATIONALITY;
  });
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem("selectedCurrency") || DEFAULT_CURRENCY;
  });

  // Update destination when defaultDestination changes
  useEffect(() => {
    if (defaultDestination) {
      setDestination(defaultDestination);
    }
  }, [defaultDestination, isOpen]);

  // Listen for nationality and currency changes from Header
  useEffect(() => {
    const handleNationalityChange = (event: CustomEvent) => {
      setNationality(event.detail);
    };
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail);
    };
    
    window.addEventListener("nationalityChanged", handleNationalityChange as EventListener);
    window.addEventListener("currencyChanged", handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener("nationalityChanged", handleNationalityChange as EventListener);
      window.removeEventListener("currencyChanged", handleCurrencyChange as EventListener);
    };
  }, []);

  // Update roomGuests when adults, children, or rooms change
  useEffect(() => {
    if (rooms > 0) {
      const adultsPerRoom = Math.floor(adults / rooms);
      const childrenPerRoom = Math.floor(children / rooms);
      const remainingAdults = adults - (adultsPerRoom * (rooms - 1));
      const remainingChildren = children - (childrenPerRoom * (rooms - 1));
      
      const newRoomGuests = Array.from({ length: rooms }, (_, index) => {
        const isLastRoom = index === rooms - 1;
        return {
          adults: isLastRoom ? remainingAdults : adultsPerRoom,
          children: isLastRoom ? remainingChildren : childrenPerRoom,
          childrenAges: isLastRoom 
            ? childrenAges.slice(index * childrenPerRoom)
            : childrenAges.slice(index * childrenPerRoom, (index + 1) * childrenPerRoom)
        };
      });
      setRoomGuests(newRoomGuests);
    }
  }, [adults, children, rooms, childrenAges]);

  const handleSearch = () => {
    if (!destination.trim()) {
      alert("Please enter a destination");
      return;
    }

    const params = new URLSearchParams({
      destination: destination.trim(),
      guests: (adults + children).toString(),
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
      checkIn: startDate,
      checkOut: endDate,
      nationality: nationality || DEFAULT_NATIONALITY,
      currency: currency || DEFAULT_CURRENCY,
    });

    // Add children ages if there are children
    if (children > 0 && childrenAges.length > 0) {
      params.set("childrenAges", childrenAges.join(","));
    }

    // Add room guest distribution
    if (roomGuests.length > 0) {
      params.set("roomGuests", JSON.stringify(roomGuests));
    }

    console.log('🔍 Searching with preferences:', { nationality, currency });
    navigate(`/search?${params.toString()}`);
    onClose();
  };

  const getGuestLabel = () => {
    const totalGuests = adults + children;
    const guestText = totalGuests === 1 ? "guest" : "guests";
    const roomText = rooms === 1 ? "room" : "rooms";
    return `${totalGuests} ${guestText} • ${rooms} ${roomText}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Hotels</DialogTitle>
          <DialogDescription>
            Enter your search criteria to find the perfect hotel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Destination
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="Enter city or destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check-in
              </Label>
              <Input
                id="checkin"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check-out
              </Label>
              <Input
                id="checkout"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guests & Rooms
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults" className="text-sm">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children" className="text-sm">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => {
                    const newChildren = Math.max(0, parseInt(e.target.value) || 0);
                    setChildren(newChildren);
                    // Initialize children ages array
                    if (newChildren > childrenAges.length) {
                      setChildrenAges([
                        ...childrenAges,
                        ...Array(newChildren - childrenAges.length).fill(0).map(() => 5)
                      ]);
                    } else if (newChildren < childrenAges.length) {
                      setChildrenAges(childrenAges.slice(0, newChildren));
                    }
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rooms" className="text-sm">Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  value={rooms}
                  onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{getGuestLabel()}</p>
          </div>

          {/* Children Ages (if children > 0) */}
          {children > 0 && (
            <div className="space-y-2">
              <Label>Children Ages</Label>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: children }).map((_, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`child-age-${index}`} className="text-xs">
                      Child {index + 1}
                    </Label>
                    <Input
                      id={`child-age-${index}`}
                      type="number"
                      min="0"
                      max="17"
                      value={childrenAges[index] || 5}
                      onChange={(e) => {
                        const newAges = [...childrenAges];
                        newAges[index] = Math.max(0, Math.min(17, parseInt(e.target.value) || 5));
                        setChildrenAges(newAges);
                      }}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nationality and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger id="nationality">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((nat) => (
                    <SelectItem key={nat.code} value={nat.code}>
                      {nat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className="pt-4">
            <Button onClick={handleSearch} className="w-full" size="lg">
              Search Hotels
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;

