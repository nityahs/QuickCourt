import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Filter,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, AdminFacility } from '../../services/adminAPI';

const AdminFacilitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<AdminFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllFacilities();
      setFacilities(response);
    } catch (err: any) {
      console.error('Error fetching facilities:', err);
      setError(err.response?.data?.error || 'Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const name = facility.name || '';
    const desc = facility.description || '';
    const status = facility.status || 'pending';

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-6">
            You need to be logged in as an administrator to access this page.
          </p>
        </div>
      </div>
    );
  }

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

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return (
        <div className="flex items-center space-x-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          <span>Approved</span>
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="flex items-center space-x-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          <span>Rejected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3" />
        <span>Pending</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facilities Management</h1>
            <p className="text-gray-600 mt-1">Manage all sports facilities on the platform</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Facilities List */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {filteredFacilities.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No facilities found</h2>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredFacilities.map((facility) => (
            <motion.div
              key={facility._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-gray-900">{facility.name}</h3>
                      {getStatusBadge(facility.status)}
                    </div>
                    <p className="text-gray-600 mt-1">{facility.address}</p>
                    <p className="text-gray-500 text-sm mt-2">Owner: {facility.ownerName || 'Unknown'}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    {facility.status === 'pending' && (
                      <>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to approve ${facility.name}?`)) {
                              try {
                                await adminAPI.updateFacilityStatus(facility._id, 'approve');
                                // Update local state
                                setFacilities(facilities.map(f => 
                                  f._id === facility._id ? {...f, status: 'approved'} : f
                                ));
                              } catch (err: any) {
                                console.error('Error approving facility:', err);
                                alert(err.response?.data?.error || 'Failed to approve facility');
                              }
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to reject ${facility.name}?`)) {
                              try {
                                await adminAPI.updateFacilityStatus(facility._id, 'reject');
                                // Update local state
                                setFacilities(facilities.map(f => 
                                  f._id === facility._id ? {...f, status: 'rejected'} : f
                                ));
                              } catch (err: any) {
                                console.error('Error rejecting facility:', err);
                                alert(err.response?.data?.error || 'Failed to reject facility');
                              }
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {facility.status === 'rejected' && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to approve ${facility.name}?`)) {
                            try {
                              await adminAPI.updateFacilityStatus(facility._id, 'approve');
                              // Update local state
                              setFacilities(facilities.map(f => 
                                f._id === facility._id ? {...f, status: 'approved'} : f
                              ));
                            } catch (err: any) {
                              console.error('Error approving facility:', err);
                              alert(err.response?.data?.error || 'Failed to approve facility');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {facility.status === 'approved' && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to reject ${facility.name}?`)) {
                            try {
                              await adminAPI.updateFacilityStatus(facility._id, 'reject');
                              // Update local state
                              setFacilities(facilities.map(f => 
                                f._id === facility._id ? {...f, status: 'rejected'} : f
                              ));
                            } catch (err: any) {
                              console.error('Error rejecting facility:', err);
                              alert(err.response?.data?.error || 'Failed to reject facility');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{facility.description}</p>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {facility.sports.map((sport, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFacilitiesPage;