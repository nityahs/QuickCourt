import { Router } from 'express';
import Court from '../models/Court.js';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

r.get('/by-facility/:facilityId', async (req,res)=>{
  const rows = await Court.find({ facilityId: req.params.facilityId, isActive:true });
  res.json(rows);
});

r.post('/', auth, roleGuard('owner'), async (req,res)=>{
  const doc = await Court.create(req.body);
  res.json(doc);
});

r.put('/:id', auth, roleGuard('owner'), async (req,res)=>{
  const doc = await Court.findByIdAndUpdate(req.params.id, req.body, { new:true });
  res.json(doc);
});

r.delete('/:id', auth, roleGuard('owner'), async (req,res)=>{
  await Court.findByIdAndDelete(req.params.id);
  res.json({ ok:true });
});

export default r;