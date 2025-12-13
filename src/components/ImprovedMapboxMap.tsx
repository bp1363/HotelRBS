import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Hotel } from '@/data/hotels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImprovedMapboxMapProps {
  hotels: Hotel[];
  selectedHotel?: string;
  onHotelSelect: (hotelId: string) => void;
  onHotelHover?: (hotelId: string | null) => void;
}

const ImprovedMapboxMap = ({ 
  hotels, 
  selectedHotel, 
  onHotelSelect,
  onHotelHover 
}: ImprovedMapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim());
      setShowTokenInput(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [46.6753, 24.7136], // Riyadh coordinates
        zoom: 12,
        maxZoom: 18,
        minZoom: 3
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true
        }), 
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowTokenInput(true);
    }
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for each hotel
    hotels.forEach(hotel => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      
      const isSelected = selectedHotel === hotel.id;
      const markerColor = isSelected ? '#000' : '#fff';
      const textColor = isSelected ? '#fff' : '#000';
      const borderColor = isSelected ? '#000' : '#ddd';
      
      el.innerHTML = `
        <div style="
          background: ${markerColor};
          color: ${textColor};
          border: 1px solid ${borderColor};
          border-radius: 20px;
          padding: 4px 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transform: scale(${isSelected ? '1.1' : '1'});
          transition: all 0.2s ease;
          white-space: nowrap;
        ">
          $${hotel.price}
        </div>
      `;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = `scale(${isSelected ? '1.15' : '1.05'})`;
        onHotelHover?.(hotel.id);
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = `scale(${isSelected ? '1.1' : '1'})`;
        onHotelHover?.(null);
      });
      
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onHotelSelect(hotel.id);
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([hotel.coordinates.lng, hotel.coordinates.lat])
        .addTo(map.current!);

      markersRef.current[hotel.id] = marker;
    });

    // Fit map to show all hotels
    if (hotels.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      hotels.forEach(hotel => {
        bounds.extend([hotel.coordinates.lng, hotel.coordinates.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 14
      });
    }
  }, [hotels, selectedHotel, onHotelSelect, onHotelHover]);

  // Update selected marker style
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([hotelId, marker]) => {
      const el = marker.getElement();
      const isSelected = selectedHotel === hotelId;
      const markerDiv = el.querySelector('div') as HTMLElement;
      
      if (markerDiv) {
        markerDiv.style.background = isSelected ? '#000' : '#fff';
        markerDiv.style.color = isSelected ? '#fff' : '#000';
        markerDiv.style.borderColor = isSelected ? '#000' : '#ddd';
        markerDiv.style.transform = `scale(${isSelected ? '1.1' : '1'})`;
      }
    });
  }, [selectedHotel]);

  if (showTokenInput) {
    return (
      <div className="h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center max-w-sm mx-auto p-6">
          <h3 className="font-semibold mb-2">Setup Mapbox</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Enter your Mapbox access token to view the map
          </p>
          <div className="space-y-3">
            <Input 
              type="text" 
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetToken()}
            />
            <Button onClick={handleSetToken} className="w-full" disabled={!tokenInput.trim()}>
              Load Map
            </Button>
            <p className="text-xs text-muted-foreground">
              Get your token from{' '}
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-primary hover:text-primary/80"
              >
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full w-full rounded-lg overflow-hidden" />;
};

export default ImprovedMapboxMap;