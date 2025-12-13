import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hotels } from "@/data/hotels";
import { Star, MapPin, Minus, Plus, RotateCcw } from "lucide-react";
import MapboxConfig from "./MapboxConfig";

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  coordinates?: [number, number];
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxToken(storedToken);
    }
  }, []);

  const selectedHotelData = selectedHotel ? hotels.find(h => h.id === selectedHotel) : null;

  // Convert hotel coordinates to [lng, lat] format for Mapbox
  const hotelsWithCoords: Hotel[] = hotels.map((hotel) => ({
    ...hotel,
    coordinates: hotel.coordinates ? [hotel.coordinates.lng, hotel.coordinates.lat] as [number, number] : undefined
  }));

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [46.6753, 24.7136], // Riyadh
      zoom: 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for each hotel
    hotelsWithCoords.forEach((hotel) => {
      if (!hotel.coordinates) return;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'hotel-marker';
      markerElement.innerHTML = `
        <div class="bg-white rounded-full px-3 py-2 shadow-lg border cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
          selectedHotel === hotel.id ? 'ring-2 ring-primary bg-primary text-white' : ''
        }">
          <span class="font-semibold text-sm">$${hotel.price}</span>
        </div>
      `;

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(hotel.coordinates)
        .addTo(map.current!);

      // Add click event
      markerElement.addEventListener('click', () => {
        setSelectedHotel(hotel.id);
        map.current!.flyTo({
          center: hotel.coordinates!,
          zoom: 13,
          duration: 1000
        });
      });

      markers.current.push(marker);
    });

    return () => {
      // Cleanup
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [mapboxToken, selectedHotel]);

  const handleZoomIn = () => {
    map.current?.zoomIn();
  };

  const handleZoomOut = () => {
    map.current?.zoomOut();
  };

  const handleReCenter = () => {
    map.current?.flyTo({
      center: [46.6753, 24.7136],
      zoom: 11,
      duration: 1000
    });
    setSelectedHotel(null);
  };

  if (!mapboxToken) {
    return (
      <Card className="h-full">
        <MapboxConfig onTokenSet={setMapboxToken} />
      </Card>
    );
  }

  return (
    <div className="space-y-4 -mt-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Map View</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReCenter}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-hidden">
          <div 
            ref={mapContainer} 
            className="h-[500px] w-full rounded-lg overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Hotel Info */}
      {selectedHotelData && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <img 
                src={selectedHotelData.images[0]} 
                alt={selectedHotelData.name}
                className="w-20 h-20 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{selectedHotelData.name}</h3>
                <div className="flex items-center space-x-2 text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{selectedHotelData.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-black text-black" />
                    <span className="text-sm font-medium">{selectedHotelData.rating}</span>
                    <span className="text-sm text-muted-foreground">({selectedHotelData.reviews})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">${selectedHotelData.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">night</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-6 bg-white rounded border shadow-sm flex items-center justify-center">
                <span className="text-xs font-medium">$</span>
              </div>
              <span className="text-muted-foreground">Hotel prices</span>
            </div>
            <span className="text-muted-foreground">Click markers to view details</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;