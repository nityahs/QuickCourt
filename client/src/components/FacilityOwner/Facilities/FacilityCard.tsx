import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';

interface FacilityCardProps {
  facility: {
    id: string;
    name: string;
    description: string;
    address: string;
    location: string;
    sportTypes: string[];
    startingPrice: number;
    rating: number;
    reviewCount: number;
    images: string[];
    amenities: string[];
    operatingHours: {
      start: string;
      end: string;
    };
    courts: Array<{
      id: string;
      name: string;
      sportType: string;
      pricePerHour: number;
    }>;
    isApproved: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onEdit, onDelete }) => {
  const formatTime = (time: string) => {
    return time.replace(':', '') + ' AM/PM';
  };

  const getStatusBadge = () => {
    if (facility.isApproved) {
      return (
        <div className="flex items-center space-x-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          <span>Approved</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
        <ClockIcon className="w-3 h-3" />
        <span>Pending</span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
        {facility.images.length > 0 ? (
          <img
            src={facility.images[0]}
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
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg">
          <span className="text-lg font-bold text-green-600">
            ${facility.startingPrice}
          </span>
          <span className="text-sm text-gray-600 ml-1">/hour</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {facility.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {facility.description}
          </p>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">
                {facility.rating}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({facility.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          {/* Location */}
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">{facility.address}</p>
              <p className="text-xs text-gray-500">{facility.location}</p>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatTime(facility.operatingHours.start)} - {formatTime(facility.operatingHours.end)}
            </span>
          </div>

          {/* Courts Count */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {facility.courts.length} court{facility.courts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Sport Types */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {facility.sportTypes.map((sport, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {facility.amenities.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {facility.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {amenity}
                </span>
              ))}
              {facility.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                  +{facility.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
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
