import { Router } from 'express';
import mongoose from 'mongoose';
import Facility from '../models/Facility.js';

const r = Router();

// GET /api/debug/db - returns db, collection and counts
r.get('/db', async (req, res, next) => {
  try {
    const conn = mongoose.connection;
    const collection = Facility.collection?.name;
    const count = await Facility.countDocuments({});
    const approved = await Facility.countDocuments({ status: 'approved' });
    res.json({ host: conn.host, db: conn.name, collection, count, approved });
  } catch (e) { next(e); }
});

export default r;
