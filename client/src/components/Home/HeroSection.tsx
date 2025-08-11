import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationSearch from './LocationSearch';
import FacilitiesMap from './FacilitiesMap';
import { facilitiesAPI } from '../../services/facilities';

interface Facility {
  _id: string;
  name: string;
  address: string;
  geolocation?: {
    lat?: number;
    lng?: number;
    coordinates?: [number, number];
  };
  lat?: number;
  lng?: number;
  sports: string[];
  startingPricePerHour: number;
  ratingAvg: number;
}

interface NormalizedFacility {
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

const HeroSection: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [facilities, setFacilities] = useState<NormalizedFacility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    console.log('Location selected:', location);
    setSelectedLocation(location);
    setShowMap(true);
    // Automatically search for facilities when location is selected
    handleSearch(location);
  };

  const handleSearch = async (locationOverride?: { lat: number; lng: number; address: string }) => {
    const locationToSearch = locationOverride || selectedLocation;
    
    console.log('Searching for facilities near:', locationToSearch);
    setIsLoading(true);
    try {
      let response;
      
      if (locationToSearch) {
        // Search for facilities near the selected location
        response = await facilitiesAPI.getAll({
          lat: locationToSearch.lat,
          lng: locationToSearch.lng,
          radius: 10, // 10km radius
          page: 1,
          limit: 50
        });
      } else {
        // Get all facilities when no location is selected
        response = await facilitiesAPI.getAll({
          page: 1,
          limit: 50
        });
      }
      
      console.log('API Response:', response.data);
      console.log('Total facilities returned:', response.data.data.length);
      
      // Filter facilities that have geolocation data - handle different structures
      const facilitiesWithLocation = response.data.data.filter((facility: Facility) => {
        // Check for different possible geolocation structures
        const geo = facility.geolocation;
        console.log('Facility:', facility.name, 'Geolocation:', geo);
        
        if (!geo) return false;
        
        // Structure 1: { lat: number, lng: number }
        if (geo.lat && geo.lng) return true;
        
        // Structure 2: { coordinates: [lng, lat] }
        if (geo.coordinates && Array.isArray(geo.coordinates) && geo.coordinates.length === 2) return true;
        
        // Structure 3: Direct lat/lng properties
        if (facility.lat && facility.lng) return true;
        
        return false;
      }).map((facility: Facility): NormalizedFacility => {
        // Normalize the geolocation structure
        const geo = facility.geolocation || {};
        let lat, lng;
        
        if (geo.lat && geo.lng) {
          lat = geo.lat;
          lng = geo.lng;
        } else if (geo.coordinates && Array.isArray(geo.coordinates)) {
          lng = geo.coordinates[0];
          lat = geo.coordinates[1];
        } else if (facility.lat && facility.lng) {
          lat = facility.lat;
          lng = facility.lng;
        }
        
        return {
          _id: facility._id,
          name: facility.name,
          address: facility.address,
          geolocation: { lat: lat!, lng: lng! },
          sports: facility.sports,
          startingPricePerHour: facility.startingPricePerHour,
          ratingAvg: facility.ratingAvg
        };
      });
      
      console.log('Facilities with location:', facilitiesWithLocation);
      console.log('Number of facilities with location:', facilitiesWithLocation.length);
      setFacilities(facilitiesWithLocation);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setFacilities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSelectedLocation(null);
    setSelectedDate('');
    setFacilities([]);
    setShowMap(false);
  };

  const handleFacilityClick = (facility: NormalizedFacility) => {
    // You can navigate to facility details page here
    console.log('Facility clicked:', facility);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-sky-700 to-blue-800 text-white">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-10 -left-10 h-56 w-56 rounded-full bg-emerald-400 blur-3xl animate-float" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-sky-400 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            <span className="text-white">Find</span> <span className="text-gradient">& Book</span> Sports Venues
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl mt-4 text-emerald-50"
          >
            Discover local facilities and get playing today
          </motion.p>

          {/* Quick Search */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-10 glass rounded-xl p-4 md:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="relative">
                <LocationSearch onLocationSelect={handleLocationSelect} placeholder="Search location" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button 
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center shadow-sporty transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Selected location display */}
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-white/10 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-emerald-200 mr-2" />
                  <span className="text-sm text-emerald-100">{selectedLocation.address}</span>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* Show all facilities button */}
            {!selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <button
                  onClick={() => {
                    if (showMap) {
                      setShowMap(false);
                      setFacilities([]);
                    } else {
                      setShowMap(true);
                      handleSearch();
                    }
                  }}
                  className="text-emerald-200 hover:text-white transition-colors text-sm underline"
                >
                  {showMap ? 'Close Map' : 'Show all facilities on map'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Map Section */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border-t-4 border-emerald-500"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  🗺️ {selectedLocation ? 'Facilities Near You' : 'All Facilities'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {selectedLocation 
                    ? (facilities.length > 0 
                        ? `Found ${facilities.length} facilities in your area`
                        : 'No facilities found in this area')
                    : (facilities.length > 0 
                        ? `Showing ${facilities.length} facilities`
                        : 'No facilities with location data found')
                  }
                </p>
              </div>
              
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <FacilitiesMap
                  facilities={facilities}
                  center={selectedLocation || { lat: 23.5937, lng: 78.9629 }} // Center of India
                  onFacilityClick={handleFacilityClick}
                />
              </div>
              
              {facilities.length === 0 && !isLoading && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-center">
                    No facilities found in this area. Try searching for a different location or expanding the search radius.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;