import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Building2, MapPin, DollarSign } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { useAuth } from '../../../contexts/AuthContext';

interface FacilityFormProps {
  facility?: any;
  onSave: (facilityData: any) => void;
  onCancel: () => void;
}

const FacilityForm: React.FC<FacilityFormProps> = ({ facility, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: facility?.name || '',
    description: facility?.description || '',
    address: facility?.address || '',
    geolocation: {
      lat: facility?.geolocation?.lat || 0,
      lng: facility?.geolocation?.lng || 0
    },
    sports: facility?.sports || [],
    startingPricePerHour: facility?.startingPricePerHour || 0,
    amenities: facility?.amenities || [],
    photos: facility?.photos || [],
    status: facility?.status || 'pending',
    ratingAvg: facility?.ratingAvg ?? 0,
    ratingCount: facility?.ratingCount ?? 0,
    highlight: facility?.highlight ?? false
  });

  const [newSport, setNewSport] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [mapsStatus, setMapsStatus] = useState<'idle'|'loading'|'ready'|'error'|'no-key'>('idle');

  // Google Places Autocomplete setup
  const addressInputRef = useRef<HTMLInputElement | null>(null); // Fallback plain input
  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null); // Container for new element
  const autocompleteElRef = useRef<any | null>(null);

  useEffect(() => {
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapsStatus('no-key'); return; }
    setMapsStatus('loading');
    const loader = new Loader({ apiKey, libraries: ['places'], version: 'weekly' });
    loader.load().then(async (google) => {
      try {
        // Use new Places API importLibrary + PlaceAutocompleteElement
        // @ts-ignore importLibrary available in modern Maps JS
        const { PlaceAutocompleteElement } = await google.maps.importLibrary('places');
        const el: any = new PlaceAutocompleteElement();
        el.id = 'facility-place-autocomplete';
        el.placeholder = 'Search address';
        el.autocompleteoptions = { fields: ['formattedAddress', 'location'] };
        el.addEventListener('gmp-placeselect', (e: any) => {
          const place = e?.detail?.place; // New structured place
            // formattedAddress & location basemap
          const formatted = place?.formattedAddress;
          // location is a LatLng object or {lat,lng}
          const loc = place?.location;
          if (formatted && loc) {
            const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
            const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
            setFormData(prev => ({
              ...prev,
              address: formatted,
              geolocation: { lat, lng }
            }));
          }
        });
        autocompleteElRef.current = el;
        if (autocompleteContainerRef.current) {
          autocompleteContainerRef.current.innerHTML = '';
          autocompleteContainerRef.current.appendChild(el);
        }
        setMapsStatus('ready');
      } catch (err) {
        console.error('Failed to initialize new Places Autocomplete Element', err);
        setMapsStatus('error');
      }
    }).catch((err) => {
      console.error('Maps JS load error', err);
      setMapsStatus('error');
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform form data to match backend model
    const transformedData = {
      // Server-managed but include where applicable
      _id: facility?._id,
  ownerId: user?.id,
      createdAt: facility?.createdAt,
      updatedAt: facility?.updatedAt,
      // Editable fields
      name: formData.name,
      description: formData.description,
      address: formData.address,
      geolocation: formData.geolocation,
      sports: formData.sports,
      amenities: formData.amenities,
      photos: formData.photos,
      startingPricePerHour: formData.startingPricePerHour,
      // Optional/meta
      status: formData.status,
      ratingAvg: formData.ratingAvg,
      ratingCount: formData.ratingCount,
      highlight: formData.highlight
    };
    
    onSave(transformedData);
  };

  const addSport = () => {
    if (newSport.trim() && !formData.sports.includes(newSport.trim())) {
      setFormData(prev => ({
        ...prev,
        sports: [...prev.sports, newSport.trim()]
      }));
      setNewSport('');
    }
  };

  const removeSport = (sport: string) => {
    setFormData(prev => ({
      ...prev,
  sports: prev.sports.filter((s: string) => s !== sport)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
  amenities: prev.amenities.filter((a: string) => a !== amenity)
    }));
  };

  const addPhoto = () => {
    if (newPhotoUrl.trim()) {
      setFormData(prev => ({ ...prev, photos: [newPhotoUrl.trim(), ...prev.photos] }));
      setNewPhotoUrl('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {facility ? 'Edit Facility' : 'Add New Facility'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <span>Basic Information</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facility Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter facility name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your facility"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Location</span>
            </h3>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Facility Address</label>
              <div ref={autocompleteContainerRef} className="w-full" />
              {/* Fallback input if maps failed */}
              {(mapsStatus === 'no-key' || mapsStatus === 'error') && (
                <input
                  type="text"
                  ref={addressInputRef}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter address manually"
                />
              )}
              <p className="text-xs text-gray-500">Lat: {formData.geolocation.lat || '—'} | Lng: {formData.geolocation.lng || '—'}</p>
              {mapsStatus !== 'ready' && (
                <p className="text-xs text-amber-600">
                  {mapsStatus === 'no-key' && 'No Google Maps API key (VITE_GOOGLE_MAPS_API_KEY). Autocomplete disabled.'}
                  {mapsStatus === 'loading' && 'Loading location autocomplete…'}
                  {mapsStatus === 'error' && 'Autocomplete failed to load; check key, billing & restrictions.'}
                </p>
              )}
            </div>
          </div>

          {/* Sports & Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span>Sports & Pricing</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Starting Price per Hour</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.startingPricePerHour}
                    onChange={(e) => setFormData(prev => ({ ...prev, startingPricePerHour: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sport Types</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add sport type"
                  />
                  <button
                    type="button"
                    onClick={addSport}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.sports.map((sport: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      <span>{sport}</span>
                      <button
                        type="button"
                        onClick={() => removeSport(sport)}
                        className="ml-1 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
            
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add amenity"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Photos (optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
            <div className="flex space-x-2 mb-2">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add photo URL"
              />
              <button
                type="button"
                onClick={addPhoto}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors"
              >
                Add
              </button>
            </div>
            {formData.photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.photos.map((url: string, i: number) => (
                  <span key={i} className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                    <span className="truncate max-w-[180px]">{url}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_: string, idx: number) => idx !== i) }))}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Facility</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FacilityForm;
