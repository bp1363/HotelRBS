import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MapboxMapProps {
  location?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const MapboxMap = ({ 
  location = 'Riyadh, Saudi Arabia', 
  center = [46.7219, 24.7136], 
  zoom = 12,
  height = 'h-96' 
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    // Check if Mapbox token is available from environment or localStorage
    const token = import.meta.env.VITE_MAPBOX_TOKEN || localStorage.getItem('mapbox_token');
    if (token) {
      setMapboxToken(token);
      setShowTokenInput(false);
      initializeMap(token);
    }
  }, []);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add a marker for the hotel location
    new mapboxgl.Marker({
      color: '#00A86B'
    })
    .setLngLat(center)
    .addTo(map.current);

    // Add attribution control
    map.current.addControl(
      new mapboxgl.AttributionControl({
        compact: true
      }),
      'bottom-right'
    );
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTokenSubmit();
    }
  };

  if (showTokenInput) {
    return (
      <Card className={`${height} flex items-center justify-center`}>
        <CardContent className="p-6 max-w-md mx-auto text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Mapbox Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To display the map, please enter your Mapbox public token.{' '}
                <a 
                  href="https://account.mapbox.com/access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Get your token here
                </a>
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="pk.eyJ1Ij..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                onKeyPress={handleKeyPress}
                className="font-mono text-sm"
              />
              <Button 
                onClick={handleTokenSubmit}
                disabled={!mapboxToken.trim()}
                className="w-full"
              >
                Load Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${height} rounded-lg overflow-hidden border`}>
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
        <p className="text-sm font-medium text-gray-800">{location}</p>
      </div>
    </div>
  );
};

export default MapboxMap;