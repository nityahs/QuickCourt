import { Router } from 'express';
import Review from '../models/Review.js';
import Facility from '../models/Facility.js';
import { auth } from '../lib/jwt.js';
const r = Router();

// Get reviews for a facility with pagination
r.get('/facility/:id', async (req, res) => {
  const page = Math.max(parseInt(req.query.page?.toString() || '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit?.toString() || '10', 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { facilityId: req.params.id };

  const [rows, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),
    Review.countDocuments(filter)
  ]);

  // Debug logging
  console.log(`\n=== DEBUG: Reviews for facility ${req.params.id} ===`);
  console.log(`Total reviews found: ${rows.length}`);
  rows.forEach((review, i) => {
    console.log(`Review ${i + 1}:`, {
      _id: review._id,
      rating: review.rating,
      text: review.text,
      hasText: !!review.text,
      textLength: review.text?.length || 0,
      userId: review.userId?.name || 'No user',
      createdAt: review.createdAt
    });
  });
  console.log('=== END DEBUG ===\n');

  res.json({ data: rows, total, page, limit });
});

// Create a review (auth required) and recompute facility rating stats
r.post('/', auth, async (req, res) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: 'Only players can leave reviews' });
  }
  const doc = await Review.create({ ...req.body, userId: req.user._id });
  // recompute facility rating
  const agg = await Review.aggregate([
    { $match: { facilityId: doc.facilityId } },
    { $group: { _id: '$facilityId', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
  ]);
  const { avg = 0, cnt = 0 } = agg[0] || {};
  await Facility.findByIdAndUpdate(doc.facilityId, { ratingAvg: avg, ratingCount: cnt });
  res.json(doc);
});

export default r;