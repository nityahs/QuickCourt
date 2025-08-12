import { Router } from 'express';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
import Facility from '../models/Facility.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';
import OwnerProfile from '../models/OwnerProfile.js';

const r = Router();

// GET dashboard stats for facility owner
r.get('/dashboard-stats/:ownerId', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Verify the user is requesting their own data
    if (req.user._id.toString() !== ownerId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get facilities owned by this user
    const facilities = await Facility.find({ ownerId: req.user._id });
    const facilityIds = facilities.map(f => f._id);
    
    // Get courts for these facilities
    const courts = await Court.find({ facilityId: { $in: facilityIds } });
    
    // Get bookings for these facilities
    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings = await Booking.find({
      facilityId: { $in: facilityIds },
      dateISO: { $gte: today },
      status: { $in: ['confirmed', 'pending'] }
    }).populate('userId', 'name email');
    
    // Calculate total revenue
    const completedBookings = await Booking.find({
      facilityId: { $in: facilityIds },
      status: 'completed'
    });
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.price, 0);
    
    // Get recent activity
    const recentActivity = await Booking.find({
      facilityId: { $in: facilityIds }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email')
    .populate('facilityId', 'name')
    .populate('courtId', 'name sport');
    
    // Prepare chart data (bookings by day for the last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const bookingsByDay = await Promise.all(last7Days.map(async (day) => {
      const count = await Booking.countDocuments({
        facilityId: { $in: facilityIds },
        dateISO: day
      });
      return { date: day, count };
    }));
    
    // Prepare response
    const stats = {
      kpis: [
        { label: 'Facilities', value: facilities.length },
        { label: 'Courts', value: courts.length },
        { label: 'Upcoming Bookings', value: upcomingBookings.length },
        { label: 'Total Revenue', value: totalRevenue, format: 'currency' }
      ],
      charts: {
        bookingsByDay
      },
      recentActivity: recentActivity.map(booking => ({
        id: booking._id,
        type: 'booking',
        status: booking.status,
        user: booking.userId ? { name: booking.userId.name, email: booking.userId.email } : null,
        facility: booking.facilityId ? { name: booking.facilityId.name } : null,
        court: booking.courtId ? { name: booking.courtId.name, sport: booking.courtId.sport } : null,
        date: booking.dateISO,
        time: `${booking.start} - ${booking.end}`,
        amount: booking.price,
        createdAt: booking.createdAt
      }))
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET all facilities for the authenticated owner
r.get('/facilities', auth, roleGuard('owner'), async (req, res) => {
  try {
    const facilities = await Facility.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: facilities });
  } catch (error) {
    console.error('Error fetching owner facilities:', error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// POST create a new facility
r.post('/facilities', auth, roleGuard('owner'), async (req, res) => {
  try {
    const facilityData = req.body;
    facilityData.ownerId = req.user._id;
    facilityData.status = 'pending'; // Default status for new facilities
    
    const facility = await Facility.create(facilityData);
    res.status(201).json({ data: facility });
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

// PUT update an existing facility
r.put('/facilities/:facilityId', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    // Verify ownership
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    if (facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update facility
    const updatedFacility = await Facility.findByIdAndUpdate(
      facilityId,
      req.body,
      { new: true }
    );
    
    res.json({ data: updatedFacility });
  } catch (error) {
    console.error('Error updating facility:', error);
    res.status(500).json({ error: 'Failed to update facility' });
  }
});

// DELETE a facility
r.delete('/facilities/:facilityId', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    // Verify ownership
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    if (facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete facility
    await Facility.findByIdAndDelete(facilityId);
    
    // Also delete associated courts
    await Court.deleteMany({ facilityId });
    
    res.json({ success: true, message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({ error: 'Failed to delete facility' });
  }
});

// GET all courts for the authenticated owner
r.get('/courts', auth, roleGuard('owner'), async (req, res) => {
  try {
    // First get the owner's facilities
    const facilities = await Facility.find({ ownerId: req.user._id });
    const facilityIds = facilities.map(f => f._id);
    
    // Then get courts for those facilities
    const courts = await Court.find({ facilityId: { $in: facilityIds } })
      .sort({ name: 1 })
      .populate('facilityId', 'name');
    
    res.json({ data: courts });
  } catch (error) {
    console.error('Error fetching owner courts:', error);
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
});

// POST create a new court
r.post('/courts', auth, roleGuard('owner'), async (req, res) => {
  try {
    const courtData = req.body;
    
    // Verify facility ownership
    const facility = await Facility.findById(courtData.facilityId);
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    if (facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this facility' });
    }
    
    // Create court
    const court = await Court.create(courtData);
    res.status(201).json({ data: court });
  } catch (error) {
    console.error('Error creating court:', error);
    res.status(500).json({ error: 'Failed to create court' });
  }
});

// PUT update an existing court
r.put('/courts/:courtId', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { courtId } = req.params;
    
    // Verify court exists
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    
    // Verify facility ownership
    const facility = await Facility.findById(court.facilityId);
    if (!facility || facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this court' });
    }
    
    // Update court
    const updatedCourt = await Court.findByIdAndUpdate(
      courtId,
      req.body,
      { new: true }
    );
    
    res.json({ data: updatedCourt });
  } catch (error) {
    console.error('Error updating court:', error);
    res.status(500).json({ error: 'Failed to update court' });
  }
});

// DELETE a court
r.delete('/courts/:courtId', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { courtId } = req.params;
    
    // Verify court exists
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    
    // Verify facility ownership
    const facility = await Facility.findById(court.facilityId);
    if (!facility || facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this court' });
    }
    
    // Delete court
    await Court.findByIdAndDelete(courtId);
    
    res.json({ success: true, message: 'Court deleted successfully' });
  } catch (error) {
    console.error('Error deleting court:', error);
    res.status(500).json({ error: 'Failed to delete court' });
  }
});

// GET all bookings for the authenticated owner's facilities
r.get('/bookings', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { status, facilityId, courtId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    // First get the owner's facilities
    const facilities = await Facility.find({ ownerId: req.user._id });
    const facilityIds = facilities.map(f => f._id);
    
    // Build filter based on query parameters
    const filter = { facilityId: { $in: facilityIds } };
    
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;
    if (courtId) filter.courtId = courtId;
    
    if (dateFrom || dateTo) {
      filter.dateISO = {};
      if (dateFrom) filter.dateISO.$gte = dateFrom;
      if (dateTo) filter.dateISO.$lte = dateTo;
    }

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    // Get paginated results with populated data
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('facilityId', 'name')
      .populate('courtId', 'name sport')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data: bookings,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
    
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET availability for a specific court and date
r.get('/availability', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { courtId, date } = req.query;
    
    if (!courtId || !date) {
      return res.status(400).json({ error: 'Court ID and date are required' });
    }
    
    // Verify the court belongs to the owner
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    
    const facility = await Facility.findById(court.facilityId);
    if (!facility || facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this court' });
    }
    
    // Get all time slots for this court and date
    const timeSlots = await TimeSlot.find({ courtId, dateISO: date }).sort({ start: 1 });
    
    // Generate default time slots if none exist (6 AM to 10 PM)
    const defaultSlots = [];
    for (let hour = 6; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const nextTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Check if slot exists
      const existingSlot = timeSlots.find(slot => slot.start === time);
      
      if (existingSlot) {
        defaultSlots.push(existingSlot);
      } else {
        defaultSlots.push({
          courtId,
          dateISO: date,
          start: time,
          end: nextTime,
          isBlocked: false,
          isBooked: false,
          priceSnapshot: court.pricePerHour || 0
        });
      }
    }
    
    res.json({ data: defaultSlots });
    
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// POST block/unblock a time slot
r.post('/block-slot', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { courtId, dateISO, start, end, isBlocked } = req.body;
    
    if (!courtId || !dateISO || !start || !end) {
      return res.status(400).json({ error: 'Court ID, date, start, and end are required' });
    }
    
    // Verify the court belongs to the owner
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    
    const facility = await Facility.findById(court.facilityId);
    if (!facility || facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this court' });
    }
    
    // Check if there's an existing booking for this slot
    const existingBooking = await Booking.findOne({
      courtId,
      dateISO,
      start,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (existingBooking && isBlocked) {
      return res.status(400).json({ error: 'Cannot block a slot with an existing booking' });
    }
    
    // Find or create the time slot
    let timeSlot = await TimeSlot.findOne({ courtId, dateISO, start });
    
    if (timeSlot) {
      // Update existing slot
      timeSlot.isBlocked = isBlocked;
      await timeSlot.save();
    } else {
      // Create new slot
      timeSlot = await TimeSlot.create({
        courtId,
        dateISO,
        start,
        end,
        isBlocked,
        priceSnapshot: court.pricePerHour || 0
      });
    }
    
    res.json({ data: timeSlot, message: `Time slot ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
    
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({ error: 'Failed to update time slot' });
  }
});

// PUT update user profile
r.put('/profile', auth, roleGuard('owner'), async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, avatar, companyName, bio, address, city, state, zipCode } = req.body;
    
    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        fullName,
        phone,
        avatar
      },
      { new: true }
    );
    
    // Update or create owner profile
    let ownerProfile = await OwnerProfile.findOne({ userId });
    
    if (ownerProfile) {
      ownerProfile.orgName = companyName;
      await ownerProfile.save();
    } else {
      ownerProfile = await OwnerProfile.create({
        userId,
        orgName: companyName
      });
    }
    
    res.json({
      data: {
        ...updatedUser.toObject(),
        companyName: ownerProfile.orgName,
        bio,
        address,
        city,
        state,
        zipCode
      }
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default r;