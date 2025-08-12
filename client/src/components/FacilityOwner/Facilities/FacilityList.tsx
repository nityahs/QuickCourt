import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Edit, 
  Trash2, 
  Eye,
  Building2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { facilityOwnerAPI } from '../../../services/facilityOwner';
import FacilityCard from './FacilityCard';
import FacilityForm from './FacilityForm';

interface Facility {
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
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

const FacilityList: React.FC = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await facilityOwnerAPI.getOwnerFacilities();
      setFacilities(response.data);
    } catch (err: any) {
      console.error('Error fetching facilities:', err);
      setError(err.response?.data?.error || 'Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = filterSport === 'all' || facility.sports.includes(filterSport);
    const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;
    
    return matchesSearch && matchesSport && matchesStatus;
  });

  const handleAddFacility = () => {
    setEditingFacility(null);
    setShowForm(true);
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setShowForm(true);
  };

  const handleDeleteFacility = async (facilityId: string) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await facilityOwnerAPI.deleteFacility(facilityId);
        setFacilities(facilities.filter(f => f._id !== facilityId));
      } catch (err: any) {
        console.error('Error deleting facility:', err);
        alert(err.response?.data?.error || 'Failed to delete facility');
      }
    }
  };

  const handleSaveFacility = async (facilityData: Partial<Facility>) => {
    try {
      if (editingFacility) {
        // Update existing facility
        const response = await facilityOwnerAPI.updateFacility(editingFacility._id, facilityData);
        setFacilities(facilities.map(f => 
          f._id === editingFacility._id ? response.data : f
        ));
      } else {
        // Add new facility
        const response = await facilityOwnerAPI.createFacility(facilityData);
        setFacilities([response.data, ...facilities]);
      }
      setShowForm(false);
      setEditingFacility(null);
    } catch (err: any) {
      console.error('Error saving facility:', err);
      alert(err.response?.data?.error || 'Failed to save facility');
    }
  };

  const allSportTypes = Array.from(new Set(facilities.flatMap(f => f.sports)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading facilities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Facilities</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchFacilities}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facilities</h1>
          <p className="text-gray-600 mt-2">Manage your sports facilities and venues</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddFacility}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Facility</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Sport Type Filter */}
          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Sports</option>
            {allSportTypes.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center px-4 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {filteredFacilities.length} facility{filteredFacilities.length !== 1 ? 'ies' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredFacilities.map((facility, index) => (
            <motion.div
              key={facility._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FacilityCard
                facility={facility}
                onEdit={() => handleEditFacility(facility)}
                onDelete={() => handleDeleteFacility(facility._id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterSport !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first facility'
            }
          </p>
          {!searchTerm && filterSport === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleAddFacility}
              className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Facility</span>
            </button>
          )}
        </motion.div>
      )}

      {/* Facility Form Modal */}
      <AnimatePresence>
        {showForm && (
          <FacilityForm
            facility={editingFacility}
            onSave={handleSaveFacility}
            onCancel={() => {
              setShowForm(false);
              setEditingFacility(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilityList;
