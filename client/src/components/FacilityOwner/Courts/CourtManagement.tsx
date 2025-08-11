import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, DollarSign, Clock, Edit, Trash2, Building2 } from 'lucide-react';

interface Court {
  id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  facilityId: string;
  facilityName: string;
  isActive: boolean;
  operatingHours: {
    start: string;
    end: string;
  };
}

const CourtManagement: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([
    {
      id: '1',
      name: 'Tennis Court 1',
      sportType: 'Tennis',
      pricePerHour: 45,
      facilityId: '1',
      facilityName: 'Elite Sports Complex',
      isActive: true,
      operatingHours: { start: '06:00', end: '22:00' }
    },
    {
      id: '2',
      name: 'Basketball Court',
      sportType: 'Basketball',
      pricePerHour: 35,
      facilityId: '1',
      facilityName: 'Elite Sports Complex',
      isActive: true,
      operatingHours: { start: '06:00', end: '22:00' }
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);

  const handleAddCourt = () => {
    setEditingCourt(null);
    setShowForm(true);
  };

  const handleEditCourt = (court: Court) => {
    setEditingCourt(court);
    setShowForm(true);
  };

  const handleDeleteCourt = (courtId: string) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      setCourts(courts.filter(c => c.id !== courtId));
    }
  };

  const getStatusBadge = (isActive: boolean) => {
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
            key={court.id}
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
                {getStatusBadge(court.isActive)}
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{court.sportType}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">${court.pricePerHour}/hour</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {court.operatingHours.start} - {court.operatingHours.end}
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
                  onClick={() => handleDeleteCourt(court.id)}
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
      {courts.length === 0 && (
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
    </div>
  );
};

export default CourtManagement;
