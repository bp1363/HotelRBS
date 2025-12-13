import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Star,
  DollarSign,
  Home,
  Wifi,
  Utensils,
  Dumbbell,
  Car,
  Shield,
  Coffee,
  Waves,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModernFilterSidebarProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedAmenities: string[];
  onAmenityToggle: (amenity: string) => void;
  selectedStarRatings: number[];
  onStarRatingToggle: (rating: number) => void;
  onClose?: () => void;
  onReset: () => void;
}

const ModernFilterSidebar = ({
  priceRange,
  onPriceRangeChange,
  selectedAmenities,
  onAmenityToggle,
  selectedStarRatings,
  onStarRatingToggle,
  onClose,
  onReset,
}: ModernFilterSidebarProps) => {
  const amenitiesList = [
    { id: "wifi", label: "Free WiFi", icon: Wifi },
    { id: "breakfast", label: "Breakfast Included", icon: Coffee },
    { id: "pool", label: "Swimming Pool", icon: Waves },
    { id: "parking", label: "Free Parking", icon: Car },
    { id: "gym", label: "Fitness Center", icon: Dumbbell },
    { id: "restaurant", label: "Restaurant", icon: Utensils },
    { id: "spa", label: "Spa Services", icon: Shield },
    { id: "roomService", label: "Room Service", icon: Home },
  ];

  const starRatings = [5, 4, 3, 2, 1];

  const activeFiltersCount = 
    (selectedAmenities.length > 0 ? 1 : 0) +
    (selectedStarRatings.length > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Filters</h2>
          {activeFiltersCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {activeFiltersCount} active filter{activeFiltersCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Filters Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Price Range */}
          <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                min={0}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Min</p>
                  <Badge variant="outline" className="text-base font-semibold">
                    ${priceRange[0]}
                  </Badge>
                </div>
                <div className="text-muted-foreground">—</div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Max</p>
                  <Badge variant="outline" className="text-base font-semibold">
                    ${priceRange[1] === 1000 ? "1000+" : priceRange[1]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Star Rating */}
          <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                Star Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {starRatings.map((rating) => (
                <div
                  key={rating}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onStarRatingToggle(rating)}
                >
                  <Checkbox
                    id={`star-${rating}`}
                    checked={selectedStarRatings.includes(rating)}
                    onCheckedChange={() => onStarRatingToggle(rating)}
                    className="border-2"
                  />
                  <label
                    htmlFor={`star-${rating}`}
                    className="flex items-center gap-1 cursor-pointer flex-1 text-sm font-medium group-hover:text-primary transition-colors"
                  >
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="ml-2 text-muted-foreground">
                      {rating === 5 ? "& above" : rating === 1 ? "& above" : "& above"}
                    </span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {amenitiesList.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onAmenityToggle(amenity.id)}
                >
                  <Checkbox
                    id={amenity.id}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={() => onAmenityToggle(amenity.id)}
                    className="border-2"
                  />
                  <label
                    htmlFor={amenity.id}
                    className="flex items-center gap-3 cursor-pointer flex-1 text-sm font-medium group-hover:text-primary transition-colors"
                  >
                    <amenity.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    {amenity.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Property Type (Example) */}
          <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Property Type
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {["Hotel", "Resort", "Villa", "Apartment"].map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="justify-center py-3 cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all text-sm"
                >
                  {type}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-6 border-t bg-gray-50 space-y-3">
        <Button
          className="w-full bg-primary hover:bg-primary-hover text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          onClick={onClose}
        >
          Show Results
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base border-2 hover:bg-gray-100 transition-colors"
          onClick={onReset}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
};

export default ModernFilterSidebar;

