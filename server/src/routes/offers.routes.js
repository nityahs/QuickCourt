import { Router } from 'express';
import { auth } from '../lib/jwt.js';
import { io } from '../ws/socket.js';
const r = Router();

// memory store (swap to DB later)
const offers = new Map(); // id -> offer

r.post('/', auth, async (req,res)=>{
  const id = `OFF-${Date.now()}`;
  const offer = { id, userId:req.user._id, ...req.body, status:'pending', createdAt:Date.now() };
  offers.set(id, offer);
  io().emit('offer:new', offer); // broadcast to owners (filter on client)
  res.json(offer);
});

r.put('/:id/:action', auth, async (req,res)=>{
  const offer = offers.get(req.params.id);
  if (!offer) return res.status(404).json({ error:'Offer not found' });
  const { action } = req.params; // accept|reject|counter
  if (action === 'counter') {
    offer.counterPrice = req.body.counterPrice;
  } else {
    offer.status = action; // accept|reject
  }
  offers.set(offer.id, offer);
  io().emit('offer:update', offer);
  res.json(offer);
});

export default r;