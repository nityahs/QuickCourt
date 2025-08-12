import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, DollarSign, Clock, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { facilityOwnerAPI } from '../../../services/facilityOwner';

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
  const { user } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newCourt, setNewCourt] = useState<Partial<Court>>({
    name: '',
    sportType: 'Tennis',
    pricePerHour: 0,
    facilityId: '',
    isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const facResp = await facilityOwnerAPI.getOwnerFacilities(user.id);
        const facs = (facResp.data || []).map((f: any) => ({ id: f._id, name: f.name }));
        setFacilities(facs);
        const facIds = facs.map(f => f.id);
        if (facIds.length) {
          const courtsResp = await facilityOwnerAPI.getOwnerCourts(facIds);
          const rows = (courtsResp.data || []).map((c: any) => ({
            id: c._id,
            name: c.name,
            sportType: c.sport,
            pricePerHour: c.pricePerHour,
            facilityId: c.facilityId,
            facilityName: facs.find(f => f.id === String(c.facilityId))?.name || '',
            isActive: c.isActive,
            operatingHours: { start: c.operatingHours?.open || '06:00', end: c.operatingHours?.close || '22:00' }
          }) as Court);
          setCourts(rows);
        } else {
          setCourts([]);
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.error || 'Failed to load courts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleAddCourt = () => {
  // reset form for new court
    setNewCourt({
      name: '',
      sportType: 'Tennis',
      pricePerHour: 0,
      facilityId: facilities[0]?.id || '',
      isActive: true,
      operatingHours: { start: '06:00', end: '22:00' }
    });
    setShowForm(true);
  };

  const handleEditCourt = (court: Court) => {
    setNewCourt({
      name: court.name,
      sportType: court.sportType,
      pricePerHour: court.pricePerHour,
      facilityId: court.facilityId,
      isActive: court.isActive,
      operatingHours: court.operatingHours,
    });
    setShowForm(true);
  };

  const handleDeleteCourt = (courtId: string) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      setCourts(courts.filter(c => c.id !== courtId));
    }
  };

  const handleSaveNewCourt = async () => {
    try {
      const payload: any = {
        name: newCourt.name,
        sport: newCourt.sportType,
        pricePerHour: newCourt.pricePerHour,
        facilityId: newCourt.facilityId,
        operatingHours: { open: newCourt.operatingHours?.start, close: newCourt.operatingHours?.end },
        isActive: newCourt.isActive,
      };
      const resp = await facilityOwnerAPI.createCourt(payload);
      const c = resp.data;
      const row: Court = {
        id: c._id,
        name: c.name,
        sportType: c.sport,
        pricePerHour: c.pricePerHour,
        facilityId: String(c.facilityId),
        facilityName: facilities.find(f => f.id === String(c.facilityId))?.name || '',
        isActive: c.isActive,
        operatingHours: { start: c.operatingHours?.open || '06:00', end: c.operatingHours?.close || '22:00' }
      };
      setCourts(prev => [row, ...prev]);
      setShowForm(false);
    } catch (e) {
      console.error(e);
      alert('Failed to create court');
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
  {loading && <div className="text-center text-gray-600">Loading courts…</div>}
  {error && <div className="text-center text-red-600">{error}</div>}
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

  {/* Create/Edit Court Modal (simple) */}
  {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Court</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input className="w-full border rounded px-3 py-2" value={newCourt.name || ''} onChange={e=>setNewCourt(prev=>({...prev, name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Sport</label>
                <select className="w-full border rounded px-3 py-2" value={newCourt.sportType || ''} onChange={e=>setNewCourt(prev=>({...prev, sportType:e.target.value}))}>
                  {['Tennis','Football','Basketball','Badminton','Cricket'].map(s=> <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Facility</label>
                <select className="w-full border rounded px-3 py-2" value={newCourt.facilityId || ''} onChange={e=>setNewCourt(prev=>({...prev, facilityId:e.target.value}))}>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Price Per Hour</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={newCourt.pricePerHour || 0} onChange={e=>setNewCourt(prev=>({...prev, pricePerHour: Number(e.target.value) || 0}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Open</label>
                  <input type="time" className="w-full border rounded px-3 py-2" value={newCourt.operatingHours?.start || '06:00'} onChange={e=>setNewCourt(prev=>({...prev, operatingHours:{...prev.operatingHours!, start:e.target.value, end: prev.operatingHours?.end || '22:00'}}))} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Close</label>
                  <input type="time" className="w-full border rounded px-3 py-2" value={newCourt.operatingHours?.end || '22:00'} onChange={e=>setNewCourt(prev=>({...prev, operatingHours:{...prev.operatingHours!, end:e.target.value, start: prev.operatingHours?.start || '06:00'}}))} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="px-4 py-2 border rounded" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSaveNewCourt}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtManagement;
