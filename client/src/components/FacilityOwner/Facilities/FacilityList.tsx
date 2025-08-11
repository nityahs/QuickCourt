import React, { useState } from 'react';
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
import FacilityCard from './FacilityCard';
import FacilityForm from './FacilityForm';

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
  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: '1',
      name: 'Elite Sports Complex',
      description: 'Premium sports facility with multiple courts and amenities',
      address: '123 Sports Avenue',
      location: 'Downtown',
      sportTypes: ['Tennis', 'Basketball', 'Badminton'],
      startingPrice: 45,
      rating: 4.8,
      reviewCount: 127,
      images: ['/facility1.jpg'],
      amenities: ['Parking', 'Shower', 'Equipment Rental', 'Cafe'],
      operatingHours: { start: '06:00', end: '22:00' },
      courts: [
        { id: '1', name: 'Tennis Court 1', sportType: 'Tennis', pricePerHour: 45 },
        { id: '2', name: 'Tennis Court 2', sportType: 'Tennis', pricePerHour: 45 },
        { id: '3', name: 'Basketball Court', sportType: 'Basketball', pricePerHour: 35 },
        { id: '4', name: 'Badminton Court', sportType: 'Badminton', pricePerHour: 25 }
      ],
      ownerId: 'owner1',
      isApproved: true
    },
    {
      id: '2',
      name: 'Community Sports Center',
      description: 'Family-friendly sports center with various activities',
      address: '456 Community Drive',
      location: 'Suburbs',
      sportTypes: ['Football', 'Cricket', 'Tennis'],
      startingPrice: 30,
      rating: 4.5,
      reviewCount: 89,
      images: ['/facility2.jpg'],
      amenities: ['Parking', 'Kids Area', 'Refreshments'],
      operatingHours: { start: '07:00', end: '21:00' },
      courts: [
        { id: '5', name: 'Football Field', sportType: 'Football', pricePerHour: 80 },
        { id: '6', name: 'Cricket Ground', sportType: 'Cricket', pricePerHour: 120 },
        { id: '7', name: 'Tennis Court', sportType: 'Tennis', pricePerHour: 30 }
      ],
      ownerId: 'owner1',
      isApproved: true
    }
  ]);

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
    if (window.confirm('Are you sure you want to delete this facility?')) {
      setFacilities(facilities.filter(f => f.id !== facilityId));
    }
  };

  const handleSaveFacility = (facilityData: Partial<Facility>) => {
    if (editingFacility) {
      // Update existing facility
      setFacilities(facilities.map(f => 
        f.id === editingFacility.id ? { ...f, ...facilityData } : f
      ));
    } else {
      // Add new facility
      const newFacility: Facility = {
        ...facilityData as Facility,
        id: Date.now().toString(),
        rating: 0,
        reviewCount: 0,
        images: [],
        courts: [],
        ownerId: 'owner1',
        isApproved: false
      };
      setFacilities([...facilities, newFacility]);
    }
    setShowForm(false);
    setEditingFacility(null);
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
