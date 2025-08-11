import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  center = { lat: 20.5937, lng: 78.9629 }, // Default to India center
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

    // Add markers for each facility
    facilities.forEach((facility) => {
      if (facility.geolocation?.lat && facility.geolocation?.lng) {
        const marker = L.marker([facility.geolocation.lat, facility.geolocation.lng])
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-lg">${facility.name}</h3>
              <p class="text-sm text-gray-600">${facility.address}</p>
              <p class="text-sm">Sports: ${facility.sports.join(', ')}</p>
              <p class="text-sm">Price: ₹${facility.startingPricePerHour}/hour</p>
              <p class="text-sm">Rating: ${facility.ratingAvg.toFixed(1)} ⭐</p>
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
      className="w-full h-96 rounded-lg shadow-lg map-container"
      style={{ minHeight: '400px' }}
    />
  );
};

export default FacilitiesMap;
