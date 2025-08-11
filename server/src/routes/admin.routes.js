import { Router } from 'express';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
const r = Router();

r.get('/facilities/pending', auth, roleGuard('admin'), async (req,res)=>{
  const rows = await Facility.find({ status:'pending' });
  res.json(rows);
});

r.put('/facilities/:id/:decision', auth, roleGuard('admin'), async (req,res)=>{
  const { decision } = req.params; // approve|reject
  const doc = await Facility.findByIdAndUpdate(req.params.id, { status: decision==='approve'?'approved':'rejected' }, { new:true });
  res.json(doc);
});

r.get('/users', auth, roleGuard('admin'), async (req,res)=>{
  const rows = await User.find().select('-passwordHash');
  res.json(rows);
});

r.put('/users/:id/:action', auth, roleGuard('admin'), async (req,res)=>{
  const { action } = req.params; // ban|unban
  const doc = await User.findByIdAndUpdate(req.params.id, { banned: action==='ban' }, { new:true });
  res.json(doc);
});

export default r;