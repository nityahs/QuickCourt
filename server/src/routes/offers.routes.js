import { Router } from 'express';
import { auth } from '../lib/jwt.js';
import { io } from '../ws/socket.js';
import Offer from '../models/Offer.js';
import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
const r = Router();

// Create a new offer
r.post('/', auth, async (req,res)=>{
  try {
    const { facilityId, courtId, bookingId, dateISO, start, end, originalPrice, offeredPrice } = req.body;
    
    const offer = await Offer.create({
      userId: req.user._id,
      facilityId,
      courtId,
      bookingId,
      dateISO,
      start,
      end,
      originalPrice,
      offeredPrice,
      status: 'pending'
    });
    
    // Emit to facility owner and the user who created the offer
    io().to(`role:owner`).emit('offer:new', offer); // broadcast to all owners
    io().to(`user:${req.user._id}`).emit('offer:new', offer); // send to the user who created the offer
    
    res.json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

r.put('/:id/:action', auth, async (req,res)=>{
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ error:'Offer not found' });
    
    const { action } = req.params; // accept|reject|counter
    
    if (action === 'counter') {
      offer.counterPrice = req.body.counterPrice;
      offer.status = 'countered';
    } else if (action === 'accept') {
      offer.status = 'accepted';
      
      // If offer is accepted, update the booking with the new price
      if (offer.bookingId) {
        await Booking.findByIdAndUpdate(offer.bookingId, { price: offer.offeredPrice });
      }
    } else if (action === 'reject') {
      offer.status = 'rejected';
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    offer.updatedAt = Date.now();
    await offer.save();
    
    // Emit to the user who created the offer
    io().to(`user:${offer.userId}`).emit('offer:update', offer);
    
    // Also emit to facility owner
    const facility = await Facility.findById(offer.facilityId);
    if (facility && facility.ownerId) {
      io().to(`user:${facility.ownerId}`).emit('offer:update', offer);
    }
    
    res.json(offer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// Get all offers for a user
r.get('/user', auth, async (req, res) => {
  try {
    const offers = await Offer.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching user offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get all offers for a facility owner
r.get('/facility/:facilityId', auth, async (req, res) => {
  try {
    const offers = await Offer.find({ facilityId: req.params.facilityId })
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching facility offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get accepted price statistics for a facility
r.get('/stats/:facilityId', auth, async (req, res) => {
  try {
    const acceptedOffers = await Offer.find({
      facilityId: req.params.facilityId,
      status: 'accepted'
    });
    
    // Calculate statistics
    const stats = {
      count: acceptedOffers.length,
      averageDiscount: 0,
      minDiscount: 0,
      maxDiscount: 0,
      acceptedPrices: []
    };
    
    if (acceptedOffers.length > 0) {
      const discounts = acceptedOffers.map(offer => {
        const discount = ((offer.originalPrice - offer.offeredPrice) / offer.originalPrice) * 100;
        return {
          originalPrice: offer.originalPrice,
          acceptedPrice: offer.offeredPrice,
          discountPercentage: discount
        };
      });
      
      stats.acceptedPrices = discounts;
      stats.averageDiscount = discounts.reduce((sum, item) => sum + item.discountPercentage, 0) / discounts.length;
      stats.minDiscount = Math.min(...discounts.map(d => d.discountPercentage));
      stats.maxDiscount = Math.max(...discounts.map(d => d.discountPercentage));
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching offer statistics:', error);
    res.status(500).json({ error: 'Failed to fetch offer statistics' });
  }
});

export default r;