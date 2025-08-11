import { Router } from 'express';
import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
const r = Router();

r.get('/user', async (req,res)=>{
  const total = await Booking.countDocuments();
  res.json({ totalBookings: total, trend: [] });
});

r.get('/owner', async (req,res)=>{
  res.json({ earnings: [], bookings: [] });
});

r.get('/admin', async (req,res)=>{
  const totalUsers = await User.countDocuments();
  const totalFacilities = await Facility.countDocuments();
  const totalBookings = await Booking.countDocuments();
  res.json({ totalUsers, totalFacilities, totalBookings });
});

export default r;