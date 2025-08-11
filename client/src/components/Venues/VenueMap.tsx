import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VenueMapProps {
  venue: {
    name: string;
    address: string;
    geolocation?: {
      lat: number;
      lng: number;
    };
  };
  height?: string;
}

const VenueMap: React.FC<VenueMapProps> = ({ venue, height = 'h-32' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Create custom venue marker
  const createVenueIcon = () => {
    return L.divIcon({
      className: 'venue-marker',
      html: `
        <div style="
          background: #10b981;
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">🏟️</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center (India) if no venue coordinates
    const center = venue.geolocation || { lat: 23.5937, lng: 78.9629 };
    
    // Initialize map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 15);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add venue marker if coordinates exist
    if (venue.geolocation?.lat && venue.geolocation?.lng) {
      const customIcon = createVenueIcon();
      const marker = L.marker([venue.geolocation.lat, venue.geolocation.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 min-w-[150px]">
            <h3 class="font-bold text-sm text-gray-900 mb-1">${venue.name}</h3>
            <p class="text-xs text-gray-600">📍 ${venue.address}</p>
          </div>
        `);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venue]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full ${height} rounded-md overflow-hidden border border-gray-200`}
    />
  );
};

export default VenueMap;
