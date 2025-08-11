import { Router } from 'express';
import Facility from '../models/Facility.js';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

// GET all facilities with coordinates (for debugging)
r.get('/debug/with-coordinates', async (req,res)=>{
  try {
    const docs = await Facility.find({
      'geolocation.lat': { $exists: true, $ne: null },
      'geolocation.lng': { $exists: true, $ne: null }
    });
    res.json({ 
      count: docs.length, 
      data: docs.map(doc => ({
        id: doc._id,
        name: doc.name,
        address: doc.address,
        geolocation: doc.geolocation,
        status: doc.status
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all facilities (for debugging)
r.get('/debug/all', async (req,res)=>{
  try {
    const docs = await Facility.find({}).limit(10);
    res.json({ 
      count: docs.length, 
      data: docs,
      sample: docs[0] ? {
        id: docs[0]._id,
        name: docs[0].name,
        geolocation: docs[0].geolocation,
        hasLat: !!docs[0].geolocation?.lat,
        hasLng: !!docs[0].geolocation?.lng,
        hasCoordinates: !!docs[0].geolocation?.coordinates
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    
    // Simple distance calculation for existing data structure
    // This works with the current data format without requiring geospatial index
    const docs = await Facility.find({
      ...filter,
      'geolocation.lat': { $exists: true, $ne: null },
      'geolocation.lng': { $exists: true, $ne: null }
    });
    
    // Filter by distance manually
    const facilitiesInRange = docs.filter(doc => {
      if (!doc.geolocation || !doc.geolocation.lat || !doc.geolocation.lng) return false;
      
      const facilityLat = doc.geolocation.lat;
      const facilityLng = doc.geolocation.lng;
      
      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (facilityLat - latitude) * Math.PI / 180;
      const dLng = (facilityLng - longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(facilityLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
    
    // Sort by distance and apply pagination
    const sortedFacilities = facilitiesInRange.sort((a, b) => {
      const aDistance = Math.sqrt(Math.pow(a.geolocation.lat - latitude, 2) + Math.pow(a.geolocation.lng - longitude, 2));
      const bDistance = Math.sqrt(Math.pow(b.geolocation.lat - latitude, 2) + Math.pow(b.geolocation.lng - longitude, 2));
      return aDistance - bDistance;
    });
    
    const paginatedFacilities = sortedFacilities.slice((page-1)*limit, page*limit);
    const total = facilitiesInRange.length;
    
    return res.json({ data: paginatedFacilities, total });
  }
  
  // Regular query without geospatial filtering
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