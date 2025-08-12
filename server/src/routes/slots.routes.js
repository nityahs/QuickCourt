import { Router } from 'express';
import TimeSlot from '../models/TimeSlot.js';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

r.get('/:courtId', async (req,res)=>{
  const { date } = req.query; // YYYY-MM-DD
  const filter = { courtId: req.params.courtId };
  if (date) filter.dateISO = date;
  const rows = await TimeSlot.find(filter);
  res.json(rows);
});

r.post('/block', auth, roleGuard('owner'), async (req,res)=>{
  const { courtId, dateISO, start, end, reason } = req.body;
  const slot = await TimeSlot.create({ courtId, dateISO, start, end, isBlocked:true });
  res.json(slot);
});

// GET availability for a specific court and date (for facility owners)
r.get('/availability', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { courtId, date } = req.query;
    
    if (!courtId || !date) {
      return res.status(400).json({ error: 'Court ID and date are required' });
    }
    
    // Verify the court belongs to the owner
    const Court = (await import('../models/Court.js')).default;
    const Facility = (await import('../models/Facility.js')).default;
    
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

// POST block/unblock a time slot (for facility owners)
r.post('/block-slot', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { courtId, dateISO, start, end, isBlocked, reason } = req.body;
    
    if (!courtId || !dateISO || !start || !end) {
      return res.status(400).json({ error: 'Court ID, date, start, and end are required' });
    }
    
    // Verify the court belongs to the owner
    const Court = (await import('../models/Court.js')).default;
    const Facility = (await import('../models/Facility.js')).default;
    
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    
    const facility = await Facility.findById(court.facilityId);
    if (!facility || facility.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this court' });
    }
    
    // Check if slot is already booked
    const existingBooking = await (await import('../models/Booking.js')).default.findOne({
      courtId,
      dateISO,
      start,
      end,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Cannot block a booked time slot' });
    }
    
    // Update or create the time slot
    const slot = await TimeSlot.findOneAndUpdate(
      { courtId, dateISO, start, end },
      { 
        isBlocked: isBlocked !== undefined ? isBlocked : true,
        priceSnapshot: court.pricePerHour || 0
      },
      { upsert: true, new: true }
    );
    
    res.json({ data: slot, message: `Time slot ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
    
  } catch (error) {
    console.error('Error blocking/unblocking slot:', error);
    res.status(500).json({ error: 'Failed to update time slot' });
  }
});

export default r;