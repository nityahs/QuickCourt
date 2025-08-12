import { Router } from 'express';
import Court from '../models/Court.js';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

// GET list with filters
r.get('/', async (req,res)=>{
  const { facilityId, facilityIds, sport, isActive } = req.query;
  const filter = {};
  if (facilityIds) {
    // support comma-separated list of facility IDs
    const ids = String(facilityIds)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (ids.length) filter.facilityId = { $in: ids };
  } else if (facilityId) {
    filter.facilityId = facilityId;
  }
  if (sport) filter.sport = sport;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  const docs = await Court.find(filter).sort({ name: 1 });
  res.json({ data: docs });
});

// GET by facility
r.get('/by-facility/:facilityId', async (req,res)=>{
  const docs = await Court.find({ facilityId: req.params.facilityId, isActive: true }).sort({ name: 1 });
  res.json(docs);
});

// GET single
r.get('/:id', async (req,res)=>{
  const doc = await Court.findById(req.params.id);
  res.json(doc);
});

// POST create (owner)
r.post('/', auth, roleGuard('owner'), async (req,res)=>{
  const body = req.body;
  const doc = await Court.create(body);
  res.json(doc);
});

// PUT update (owner)
r.put('/:id', auth, roleGuard('owner'), async (req,res)=>{
  const doc = await Court.findByIdAndUpdate(req.params.id, req.body, { new:true });
  res.json(doc);
});

export default r;