import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, DollarSign, Clock, Edit, Trash2, Building2 } from 'lucide-react';
import CourtForm from './CourtForm';

interface Court {
  _id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  facilityId: string;
  facilityName?: string;
  status?: string;
  operatingHours?: {
    start: string;
    end: string;
  };
}

import { facilityOwnerAPI, facilityOwnerCourtAPI, facilityOwnerManagementAPI } from '../../../services/facilityOwner';

const CourtManagement: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  
  // Fetch courts from the backend
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await facilityOwnerAPI.getOwnerCourts();
        setCourts(response.data);
      } catch (err: any) {
        console.error('Error fetching courts:', err);
        setError(err.response?.data?.error || 'Failed to load courts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourts();
  }, []);

  const handleAddCourt = () => {
    setEditingCourt(null);
    setShowForm(true);
  };

  const handleEditCourt = (court: Court) => {
    setEditingCourt(court);
    setShowForm(true);
  };
  
  const handleSaveCourt = async (courtData: any) => {
    try {
      if (editingCourt?._id) {
        // Update existing court
        const response = await facilityOwnerCourtAPI.updateCourt(editingCourt._id, courtData);
        setCourts(courts.map(c => 
          c._id === editingCourt._id ? response.data : c
        ));
      } else {
        // Add new court
        const response = await facilityOwnerCourtAPI.createCourt(courtData);
        setCourts([response.data, ...courts]);
      }
      setShowForm(false);
      setEditingCourt(null);
    } catch (err: any) {
      console.error('Error saving court:', err);
      alert(err.response?.data?.error || 'Failed to save court');
    }
  };

  const handleDeleteCourt = async (courtId: string) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        await facilityOwnerManagementAPI.deleteCourt(courtId);
        setCourts(courts.filter(c => c._id !== courtId));
      } catch (err: any) {
        console.error('Error deleting court:', err);
        alert(err.response?.data?.error || 'Failed to delete court');
      }
    }
  };

  const getStatusBadge = (status?: string) => {
    const isActive = status === 'active' || status === undefined;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        isActive 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Court Management</h1>
          <p className="text-gray-600 mt-2">Manage individual courts and their settings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddCourt}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Court</span>
        </motion.button>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {courts.map((court, index) => (
          <motion.div
            key={court._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{court.name}</h3>
                  <p className="text-sm text-gray-500">{court.facilityName}</p>
                </div>
                {getStatusBadge(court.status)}
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{court.sport}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">${court.pricePerHour}/hour</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {court.operatingHours ? `${court.operatingHours.start} - ${court.operatingHours.end}` : '06:00 - 22:00'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditCourt(court)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteCourt(court._id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && courts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courts found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first court</p>
          <button
            onClick={handleAddCourt}
            className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Court</span>
          </button>
        </motion.div>
      )}
      
      {/* Court Form Modal */}
      <AnimatePresence>
        {showForm && (
          <CourtForm
            court={editingCourt}
            onSave={handleSaveCourt}
            onCancel={() => {
              setShowForm(false);
              setEditingCourt(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourtManagement;
