import { Router } from 'express';
import Booking from '../models/Booking.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';
import { auth } from '../lib/jwt.js';
import { adjustReliability } from '../lib/reliability.js';
import { roleGuard } from '../lib/roleGuard.js';
import { createStripePaymentIntent, confirmStripePayment } from '../lib/stripe.js';
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

// GET all bookings for facilities owned by the authenticated owner
r.get('/owner', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { status, facilityId, courtId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    // First get the owner's facilities
    const Facility = (await import('../models/Facility.js')).default;
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

// Create pending booking with Stripe payment intent
r.post('/create-pending', auth, async (req, res, next) => {
  try {
    const { court, date, startTime, duration, amount } = req.body;
    
    // Validate required fields
    if (!court || !date || !startTime || !duration || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTime = `${String(hours + duration).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      courtId: court,
      dateISO: date,
      start: startTime,
      end: endTime,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Create Stripe payment intent
    const paymentIntent = await createStripePaymentIntent(amount, 'inr', {
      court_id: court,
      booking_date: date,
      start_time: startTime,
      duration: duration.toString()
    });

    // Create pending booking
    const booking = await Booking.create({
      userId: req.user._id,
      courtId: court,
      dateISO: date,
      start: startTime,
      end: endTime,
      price: amount,
      status: 'pending',
      payment: {
        method: 'stripe',
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount
      }
    });

    res.json({
      booking,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      message: 'Pending booking created successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Verify payment and confirm booking
r.post('/verify-payment', auth, async (req, res, next) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    // Validate required fields
    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    // Find the pending booking
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
      status: 'pending'
    });

    if (!booking) {
      return res.status(404).json({ error: 'Pending booking not found' });
    }

    // Confirm payment with Stripe
    const paymentIntent = await confirmStripePayment(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Update booking status and payment details
    booking.status = 'confirmed';
    booking.payment.txnId = paymentIntent.id;
    booking.payment.status = paymentIntent.status;
    booking.confirmedAt = new Date();
    await booking.save();

    // Mark the time slot as booked
    await TimeSlot.findOneAndUpdate(
      {
        courtId: booking.courtId,
        dateISO: booking.dateISO,
        start: booking.start,
        end: booking.end
      },
      { 
        isBooked: true, 
        priceSnapshot: booking.price 
      },
      { upsert: true }
    );

    res.json({
      success: true,
      booking,
      message: 'Payment verified and booking confirmed'
    });

  } catch (error) {
    next(error);
  }
});

// Get available time slots for a court on a specific date
r.get('/available-times', async (req, res, next) => {
  try {
    const { court, date } = req.query;

    if (!court || !date) {
      return res.status(400).json({ error: 'Court and date are required' });
    }

    // Generate time slots (6 AM to 10 PM)
    const timeSlots = [];
    for (let hour = 6; hour <= 22; hour++) {
      timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
    }

    // Get existing bookings for this court and date
    const existingBookings = await Booking.find({
      courtId: court,
      dateISO: date,
      status: { $in: ['confirmed', 'pending'] }
    });

    // Filter out booked time slots
    const availableTimes = timeSlots.filter(time => {
      const [hours] = time.split(':').map(Number);
      return !existingBookings.some(booking => {
        const startHour = parseInt(booking.start.split(':')[0]);
        const endHour = parseInt(booking.end.split(':')[0]);
        return hours >= startHour && hours < endHour;
      });
    });

    res.json(availableTimes);

  } catch (error) {
    next(error);
  }
});

export default r;