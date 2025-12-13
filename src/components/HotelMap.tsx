import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface HotelMapProps {
  latitude: number;
  longitude: number;
  hotelName: string;
  address?: string;
}

const HotelMap = ({ latitude, longitude, hotelName, address }: HotelMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only initialize map if we have valid coordinates
    if (!latitude || !longitude || !mapRef.current) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Dynamically load Leaflet CSS and JS
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Load JS
      if (!(window as any).L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const L = (window as any).L;

      // Initialize map
      const map = L.map(mapRef.current).setView([latitude, longitude], 15);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: #ef4444;
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="white"
              style="transform: rotate(45deg);"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      // Add marker
      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

      // Add popup
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${hotelName}</h3>
          ${address ? `<p style="margin: 0; font-size: 14px; color: #666;">${address}</p>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();
    };

    loadLeaflet().catch(console.error);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, hotelName, address]);

  // Show fallback if no coordinates
  if (!latitude || !longitude) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Location not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border shadow-sm">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default HotelMap;
