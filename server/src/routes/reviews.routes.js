import { Router } from 'express';
import Review from '../models/Review.js';
import Facility from '../models/Facility.js';
import { auth } from '../lib/jwt.js';
const r = Router();

r.get('/facility/:id', async (req,res)=>{
  const rows = await Review.find({ facilityId: req.params.id }).sort({ createdAt:-1 });
  res.json(rows);
});

r.post('/', auth, async (req,res)=>{
  const doc = await Review.create({ ...req.body, userId: req.user._id });
  // recompute facility rating
  const agg = await Review.aggregate([
    { $match: { facilityId: doc.facilityId } },
    { $group: { _id: '$facilityId', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
  ]);
  const { avg=0, cnt=0 } = agg[0] || {};
  await Facility.findByIdAndUpdate(doc.facilityId, { ratingAvg: avg, ratingCount: cnt });
  res.json(doc);
});

export default r;