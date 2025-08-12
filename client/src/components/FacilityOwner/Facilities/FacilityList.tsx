import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Building2 } from 'lucide-react';
import FacilityCard from './FacilityCard';
import FacilityForm from './FacilityForm';
import { useAuth } from '../../../contexts/AuthContext';
import { facilityOwnerAPI } from '../../../services/facilityOwner';

interface Facility {
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
  ownerId: string;
  isApproved: boolean;
}

const FacilityList: React.FC = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const resp = await facilityOwnerAPI.getOwnerFacilities(user.id);
        // Transform server model to UI model
        const rows = (resp.data || []).map((f: any) => ({
          id: f._id,
          name: f.name,
          description: f.description,
          address: f.address,
          location: f.address,
          sportTypes: f.sports || [],
          startingPrice: f.startingPricePerHour || 0,
          rating: f.ratingAvg || 0,
          reviewCount: f.ratingCount || 0,
          images: f.photos || [],
          amenities: f.amenities || [],
          operatingHours: { start: '06:00', end: '22:00' },
          courts: [],
          ownerId: f.ownerId,
          isApproved: f.status === 'approved'
        } as Facility));
        setFacilities(rows);
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.error || 'Failed to load facilities');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = filterSport === 'all' || facility.sportTypes.includes(filterSport);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && facility.isApproved) ||
                         (filterStatus === 'pending' && !facility.isApproved);
    
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

  const handleDeleteFacility = (facilityId: string) => {
    // Deletion API not implemented; remove locally for now
    if (window.confirm('Are you sure you want to delete this facility?')) {
      setFacilities(facilities.filter(f => f.id !== facilityId));
    }
  };

  const handleSaveFacility = async (facilityData: Partial<Facility>) => {
    try {
      if (editingFacility) {
        // Update existing facility on server
        const payload: any = {
          name: facilityData.name,
          description: facilityData.description,
          address: facilityData.address,
          sports: facilityData.sportTypes,
          amenities: facilityData.amenities,
          startingPricePerHour: facilityData.startingPrice,
          photos: facilityData.images,
        };
        const resp = await facilityOwnerAPI.updateFacility(editingFacility.id, payload);
        const f = resp.data;
        setFacilities(prev => prev.map(x => x.id === editingFacility.id ? {
          ...x,
          name: f.name,
          description: f.description,
          address: f.address,
          sportTypes: f.sports || [],
          amenities: f.amenities || [],
          startingPrice: f.startingPricePerHour || 0,
          images: f.photos || [],
          isApproved: f.status === 'approved'
        } : x));
      } else {
        // Create on server
        const payload: any = {
          name: facilityData.name,
          description: facilityData.description,
          address: facilityData.address,
          sports: facilityData.sportTypes,
          amenities: facilityData.amenities,
          startingPricePerHour: facilityData.startingPrice,
          photos: facilityData.images,
        };
        const resp = await facilityOwnerAPI.createFacility(payload);
        const f = resp.data;
        const newFacility: Facility = {
          id: f._id,
          name: f.name,
          description: f.description,
          address: f.address,
          location: f.address,
          sportTypes: f.sports || [],
          startingPrice: f.startingPricePerHour || 0,
          rating: f.ratingAvg || 0,
          reviewCount: f.ratingCount || 0,
          images: f.photos || [],
          amenities: f.amenities || [],
          operatingHours: { start: '06:00', end: '22:00' },
          courts: [],
          ownerId: f.ownerId,
          isApproved: f.status === 'approved'
        };
        setFacilities(prev => [...prev, newFacility]);
      }
      setShowForm(false);
      setEditingFacility(null);
    } catch (e) {
      console.error(e);
      alert('Failed to save facility');
    }
  };

  const allSportTypes = Array.from(new Set(facilities.flatMap(f => f.sportTypes)));

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
      {loading && (
        <div className="text-center text-gray-600">Loading facilities…</div>
      )}
      {error && (
        <div className="text-center text-red-600">{error}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredFacilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FacilityCard
                facility={facility}
                onEdit={() => handleEditFacility(facility)}
                onDelete={() => handleDeleteFacility(facility.id)}
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
