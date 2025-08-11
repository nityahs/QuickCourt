import { Router } from 'express';
import Coupon from '../models/Coupon.js';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

r.post('/', auth, roleGuard('owner','admin'), async (req,res)=>{
  const doc = await Coupon.create({ ...req.body, createdBy: req.user._id });
  res.json(doc);
});

r.post('/validate', auth, async (req,res)=>{
  const { code } = req.body;
  const c = await Coupon.findOne({ code });
  if (!c) return res.status(404).json({ error:'Invalid code' });
  const now = Date.now();
  const ok = now >= c.validFrom && now <= c.validTo && c.redeemed < c.maxRedemptions;
  res.json({ valid: ok, coupon: c });
});

export default r;