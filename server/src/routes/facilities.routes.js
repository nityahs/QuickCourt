import { Router } from 'express';
import Facility from '../models/Facility.js';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

// GET list with filters + pagination
r.get('/', async (req,res)=>{
  const { sport, q, minPrice, maxPrice, rating, page=1, limit=10, includeAll, ownerId, lat, lng, radius=10 } = req.query;
  const filter = includeAll === 'true' ? {} : { status: 'approved' };
  if (sport) filter.sports = sport;
  if (rating) filter.ratingAvg = { $gte: Number(rating) };
  if (minPrice || maxPrice) filter.startingPricePerHour = { $gte: Number(minPrice||0), $lte: Number(maxPrice||1e9) };
  if (q) filter.name = new RegExp(q,'i');
  if (ownerId) filter.ownerId = ownerId;
  
  let query = Facility.find(filter);
  
  // Add geospatial filtering if lat/lng provided
  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    
    // Add geospatial query to find facilities within radius
    query = query.where('geolocation').near({
      center: {
        type: 'Point',
        coordinates: [longitude, latitude] // MongoDB uses [lng, lat] order
      },
      maxDistance: radiusKm * 1000, // Convert km to meters
      spherical: true
    });
  }
  
  const docs = await query.skip((page-1)*limit).limit(Number(limit)).sort({ highlight:-1, ratingAvg:-1 });
  const total = await Facility.countDocuments(filter);
  res.json({ data: docs, total });
});

// GET single
r.get('/:id', async (req,res)=>{
  const doc = await Facility.findById(req.params.id);
  res.json(doc);
});

// POST create (owner)
r.post('/', auth, roleGuard('owner'), async (req,res)=>{
  const body = req.body; body.ownerId = req.user._id; body.status = 'pending';
  const doc = await Facility.create(body);
  res.json(doc);
});

// PUT update (owner)
r.put('/:id', auth, roleGuard('owner'), async (req,res)=>{
  const doc = await Facility.findOneAndUpdate({ _id:req.params.id, ownerId:req.user._id }, req.body, { new:true });
  res.json(doc);
});

export default r;