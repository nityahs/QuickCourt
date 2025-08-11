import { Router } from 'express';
import Booking from '../models/Booking.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';
import { auth } from '../lib/jwt.js';
import { adjustReliability } from '../lib/reliability.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

// Create booking (atomic-ish)
r.post('/', auth, async (req,res,next)=>{
  try{
    const { facilityId, courtId, dateISO, start, end, price } = req.body;
    const slot = await TimeSlot.findOne({ courtId, dateISO, start, end, isBlocked:false, isBooked:false });
    if (!slot) return res.status(400).json({ error:'Slot unavailable' });
    slot.isBooked = true; slot.priceSnapshot = price; await slot.save();
    const booking = await Booking.create({ userId:req.user._id, facilityId, courtId, dateISO, start, end, price, status:'confirmed', payment:{ method:'simulated', txnId: `SIM-${Date.now()}` } });
    res.json(booking);
  }catch(e){ next(e); }
});

// My bookings
r.get('/me', auth, async (req,res)=>{
  const rows = await Booking.find({ userId:req.user._id }).sort({ createdAt:-1 });
  res.json(rows);
});

// Get all bookings for facilities owned by a specific owner
r.get('/owner/:ownerId', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { status, facilityId, courtId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    // Verify the user is requesting their own data
    if (req.user._id.toString() !== ownerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build filter based on query parameters
    const filter= {};
    
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

// Cancel
r.put('/:id/cancel', auth, async (req,res)=>{
  const b = await Booking.findOne({ _id:req.params.id, userId:req.user._id });
  if (!b) return res.status(404).json({ error:'Not found' });
  if (b.status !== 'confirmed') return res.status(400).json({ error:'Not cancellable' });
  b.status = 'cancelled'; await b.save();
  await TimeSlot.findOneAndUpdate({ courtId:b.courtId, dateISO:b.dateISO, start:b.start, end:b.end }, { isBooked:false });
  const u = await User.findById(req.user._id);
  u.reliabilityScore = adjustReliability(u.reliabilityScore, 'cancelled');
  u.cancellations += 1; await u.save();
  res.json(b);
});

export default r;