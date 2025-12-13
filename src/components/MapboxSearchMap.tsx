import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Hotel } from '@/data/hotels';

interface MapboxSearchMapProps {
  hotels: Hotel[];
  selectedHotel?: string;
  onHotelSelect: (hotelId: string) => void;
}

const MapboxSearchMap = ({ hotels, selectedHotel, onHotelSelect }: MapboxSearchMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');

  useEffect(() => {
    // For now, we'll use a placeholder input for mapbox token
    // In production, this should come from environment variables
    const token = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2x3eW1hOXRlMGlpejJtcjI4YWkxOWZqbiJ9.example';
    setMapboxToken(token);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [46.6753, 24.7136], // Riyadh coordinates
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each hotel
    hotels.forEach(hotel => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = `
        <div class="bg-white rounded-full px-3 py-1 shadow-lg border border-gray-200 font-semibold text-sm cursor-pointer hover:bg-gray-50 ${
          selectedHotel === hotel.id ? 'ring-2 ring-primary' : ''
        }">
          $${hotel.price}
        </div>
      `;
      
      el.addEventListener('click', () => {
        onHotelSelect(hotel.id);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([hotel.coordinates.lng, hotel.coordinates.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [hotels, selectedHotel, onHotelSelect]);

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Mapbox token not configured</p>
          <div className="max-w-sm mx-auto">
            <input 
              type="text" 
              placeholder="Enter your Mapbox public token"
              className="w-full p-2 border rounded"
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Get your token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full w-full rounded-lg" />;
};

export default MapboxSearchMap;