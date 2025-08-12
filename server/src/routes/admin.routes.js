import { Router } from 'express';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
const r = Router();

r.get('/facilities', auth, roleGuard('admin'), async (req,res)=>{
  const facilities = await Facility.find().populate('ownerId', 'fullName name');
  
  // Transform data to include owner name
  const transformedFacilities = facilities.map(facility => {
    const facilityObj = facility.toObject();
    return {
      ...facilityObj,
      ownerName: facilityObj.ownerId?.fullName || facilityObj.ownerId?.name || 'Unknown'
    };
  });
  
  res.json(transformedFacilities);
});

r.get('/facilities/pending', auth, roleGuard('admin'), async (req,res)=>{
  const rows = await Facility.find({ status:'pending' });
  res.json(rows);
});

r.put('/facilities/:id/:decision', auth, roleGuard('admin'), async (req,res)=>{
  const { decision } = req.params; // approve|reject
  const doc = await Facility.findByIdAndUpdate(req.params.id, { status: decision==='approve'?'approved':'rejected' }, { new:true });
  res.json(doc);
});

r.get('/users', auth, roleGuard('admin'), async (req,res)=>{
  const users = await User.find().select('-passwordHash');
  
  // Transform data to match client expectations
  const transformedUsers = users.map(user => {
    // Map 'owner' role to 'facility_owner' for client compatibility
    let clientRole = user.role;
    if (clientRole === 'owner') {
      clientRole = 'facility_owner';
    }
    
    return {
      ...user.toObject(),
      id: user._id,
      fullName: user.fullName || user.name, // Use fullName if available, otherwise use name
      role: clientRole,
      isVerified: user.otpVerified
    };
  });
  
  res.json(transformedUsers);
});

r.put('/users/:id/:action', auth, roleGuard('admin'), async (req,res)=>{
  const { action } = req.params; // ban|unban

  // Fetch target user first to enforce role-based restriction
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  // Do not allow banning another admin
  if (targetUser.role === 'admin' && action === 'ban') {
    return res.status(403).json({ error: 'Cannot ban a user with admin role' });
  }

  const doc = await User.findByIdAndUpdate(
    req.params.id,
    { banned: action==='ban' },
    { new:true }
  );
  
  // Transform data to match client expectations
  const transformedUser = {
    ...doc.toObject(),
    id: doc._id,
    fullName: doc.fullName || doc.name,
    role: doc.role === 'owner' ? 'facility_owner' : doc.role,
    isVerified: doc.otpVerified
  };
  
  res.json(transformedUser);
});

// Get bookings for a specific user
r.get('/users/:id/bookings', auth, roleGuard('admin'), async (req,res)=>{
  try {
    const bookings = await Booking.find({ userId: req.params.id })
      .populate('facilityId', 'name')
      .populate('courtId', 'name')
      .sort({ createdAt: -1 });
    
    // Transform bookings to match client expectations
    const transformedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      return {
        id: bookingObj._id,
        venueName: bookingObj.facilityId?.name || 'Unknown Venue',
        courtName: bookingObj.courtId?.name || 'Unknown Court',
        date: bookingObj.dateISO,
        startTime: bookingObj.start,
        duration: calculateDuration(bookingObj.start, bookingObj.end),
        totalPrice: bookingObj.price,
        status: bookingObj.status,
        createdAt: bookingObj.createdAt
      };
    });
    
    res.json(transformedBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// Helper function to calculate duration in hours
function calculateDuration(start, end) {
  const startHour = parseInt(start.split(':')[0]);
  const startMinute = parseInt(start.split(':')[1]);
  const endHour = parseInt(end.split(':')[0]);
  const endMinute = parseInt(end.split(':')[1]);
  
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  return Math.round((endTimeInMinutes - startTimeInMinutes) / 60 * 10) / 10; // Round to 1 decimal place
}

export default r;