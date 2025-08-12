import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Clock, 
  Edit, 
  Trash2, 
  Building2,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';

interface FacilityCardProps {
  facility: {
    _id: string;
    name: string;
    description: string;
    address: string;
    geolocation: {
      lat: number;
      lng: number;
    };
    sports: string[];
    startingPricePerHour: number;
    ratingAvg: number;
    ratingCount: number;
    photos: string[];
    amenities: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onEdit, onDelete }) => {
  const getStatusBadge = () => {
    if (facility.status === 'approved') {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
             style={{ backgroundColor: 'var(--badge-bg, #dcfce7)', color: 'var(--badge-text, #16a34a)' }}>
          <CheckCircle className="w-3 h-3" />
          <span>Approved</span>
        </div>
      );
    } else if (facility.status === 'rejected') {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
             style={{ backgroundColor: 'var(--badge-bg, #fee2e2)', color: 'var(--badge-text, #dc2626)' }}>
          <ClockIcon className="w-3 h-3" />
          <span>Rejected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
           style={{ backgroundColor: 'var(--badge-bg, #fef3c7)', color: 'var(--badge-text, #d97706)' }}>
        <ClockIcon className="w-3 h-3" />
        <span>Pending</span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="backdrop-blur-xl rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      style={{ backgroundColor: 'var(--card-bg, white)', borderColor: 'var(--card-border, rgba(229, 231, 235, 0.5))' }}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
        {facility.photos && facility.photos.length > 0 ? (
          <img
            src={facility.photos[0]}
            alt={facility.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {getStatusBadge()}
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 left-4 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111827)' }}>
          <span className="text-lg font-bold" style={{ color: 'var(--accent-primary, #10b981)' }}>
            ₹{facility.startingPricePerHour}
          </span>
          <span className="text-sm ml-1" style={{ color: 'var(--text-secondary, #4b5563)' }}>/hour</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 line-clamp-1" style={{ color: 'var(--text-primary, #111827)' }}>
            {facility.name}
          </h3>
          <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-secondary, #4b5563)' }}>
            {facility.description || 'No description provided'}
          </p>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary, #111827)' }}>
                {facility.ratingAvg.toFixed(1)}
              </span>
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary, #4b5563)' }}>
              ({facility.ratingCount} reviews)
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          {/* Location */}
            <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-secondary, #4b5563)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary, #111827)' }}>{facility.address}</p>
              {facility.geolocation && typeof facility.geolocation.lat === 'number' && typeof facility.geolocation.lng === 'number' && (
                <p className="text-xs" style={{ color: 'var(--text-secondary, #4b5563)' }}>
                  {facility.geolocation.lat.toFixed(6)}, {facility.geolocation.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--text-secondary, #4b5563)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary, #4b5563)' }}>
              Created: {new Date(facility.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Sport Types */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(facility.sports || []).map((sport, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: 'var(--accent-primary, #10b981)', color: 'var(--button-text, white)', opacity: '0.8' }}
              >
                {sport}
              </span>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {facility.amenities && facility.amenities.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary, #4b5563)' }}>
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {facility.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-md"
                  style={{ backgroundColor: 'var(--badge-bg, #f3f4f6)', color: 'var(--badge-text, #4b5563)' }}
                >
                  {amenity}
                </span>
              ))}
              {facility.amenities.length > 3 && (
                <span className="px-2 py-1 text-xs rounded-md"
                  style={{ backgroundColor: 'var(--badge-bg, #f3f4f6)', color: 'var(--badge-text, #4b5563)' }}
                >
                  +{facility.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4" style={{ borderTop: '1px solid var(--border-color, rgba(229, 231, 235, 0.5))' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--button-primary-bg, #10b981)', color: 'var(--button-text, white)' }}
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--button-secondary-bg, #ef4444)', color: 'var(--button-text, white)' }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FacilityCard;
