import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  Map,
  ChevronDown,
  TrendingUp,
  Star,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchResultsHeaderProps {
  resultsCount: number;
  destination: string;
  viewMode: "grid" | "list" | "map";
  onViewModeChange: (mode: "grid" | "list" | "map") => void;
  onFilterClick: () => void;
  onSortChange: (sortBy: string) => void;
  currentSort: string;
}

const SearchResultsHeader = ({
  resultsCount,
  destination,
  viewMode,
  onViewModeChange,
  onFilterClick,
  onSortChange,
  currentSort,
}: SearchResultsHeaderProps) => {
  const sortOptions = [
    { value: "recommended", label: "Recommended", icon: Star },
    { value: "priceLow", label: "Price: Low to High", icon: TrendingUp },
    { value: "priceHigh", label: "Price: High to Low", icon: DollarSign },
    { value: "rating", label: "Highest Rating", icon: Star },
    { value: "distance", label: "Distance", icon: Map },
  ];

  const currentSortOption = sortOptions.find(opt => opt.value === currentSort) || sortOptions[0];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4">
        {/* Top Row: Results Count & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Results Info */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {destination}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{resultsCount}</span> properties found
              </p>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none border-2 hover:border-primary transition-colors"
                >
                  <currentSortOption.icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Sort:</span>
                  <span className="font-semibold ml-1">{currentSortOption.label}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className="cursor-pointer"
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                    {currentSort === option.value && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className={`rounded-none border-0 ${viewMode === "grid" ? "bg-primary text-white" : ""}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={`rounded-none border-0 ${viewMode === "list" ? "bg-primary text-white" : ""}`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("map")}
                className={`rounded-none border-0 ${viewMode === "map" ? "bg-primary text-white" : ""}`}
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Button (Mobile) */}
            <Button
              variant="outline"
              onClick={onFilterClick}
              className="flex-1 sm:hidden border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Quick Filters (Optional) */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
          >
            ⭐ Top Rated
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
          >
            🔥 Hot Deals
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
          >
            🏖️ Beach Front
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
          >
            🏙️ City Center
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
          >
            ✨ Luxury
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
          >
            💰 Budget Friendly
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsHeader;

