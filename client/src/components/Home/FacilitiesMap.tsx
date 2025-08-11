import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create custom attractive markers
const createCustomIcon = (color: string = '#10b981') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">🏟️</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Create different colored icons for variety
const markerColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
let colorIndex = 0;

interface Facility {
  _id: string;
  name: string;
  address: string;
  geolocation: {
    lat: number;
    lng: number;
  };
  sports: string[];
  startingPricePerHour: number;
  ratingAvg: number;
}

interface FacilitiesMapProps {
  facilities: Facility[];
  center?: { lat: number; lng: number };
  onFacilityClick?: (facility: Facility) => void;
}

const FacilitiesMap: React.FC<FacilitiesMapProps> = ({ 
  facilities, 
  center = { lat: 23.5937, lng: 78.9629 }, // Center of India
  onFacilityClick 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 10);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    // Reset color index
    colorIndex = 0;

    // Add markers for each facility
    facilities.forEach((facility) => {
      if (facility.geolocation?.lat && facility.geolocation?.lng) {
        const color = markerColors[colorIndex % markerColors.length];
        const customIcon = createCustomIcon(color);
        colorIndex++;

        const marker = L.marker([facility.geolocation.lat, facility.geolocation.lng], { icon: customIcon })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-bold text-lg text-gray-900 mb-2">${facility.name}</h3>
              <p class="text-sm text-gray-600 mb-2">📍 ${facility.address}</p>
              <p class="text-sm text-blue-600 mb-2">🏃 ${facility.sports.join(', ')}</p>
              <p class="text-sm text-green-600 mb-2">💰 ₹${facility.startingPricePerHour}/hour</p>
              <p class="text-sm text-yellow-600">⭐ ${facility.ratingAvg.toFixed(2)} rating</p>
            </div>
          `);

        if (onFacilityClick) {
          marker.on('click', () => onFacilityClick(facility));
        }
      }
    });

    // Fit map to show all markers if there are facilities
    if (facilities.length > 0) {
      const group = new L.FeatureGroup(
        facilities
          .filter(f => f.geolocation?.lat && f.geolocation?.lng)
          .map(f => L.marker([f.geolocation.lat, f.geolocation.lng]))
      );
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [facilities, onFacilityClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-80 rounded-lg shadow-lg map-container"
      style={{ minHeight: '320px' }}
    />
  );
};

export default FacilitiesMap;
