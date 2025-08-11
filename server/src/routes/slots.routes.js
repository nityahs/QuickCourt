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

export default r;