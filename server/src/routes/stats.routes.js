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
  try {
    // Basic counts
    const [totalUsers, totalFacilities, totalBookings] = await Promise.all([
      User.countDocuments(),
      Facility.countDocuments(),
      Booking.countDocuments()
    ]);
    
    // Count facility owners
    const totalOwners = await User.countDocuments({ role: 'owner' });
    
    // Get booking activity over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const bookingTrends = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get user registration trends (last 6 months)
    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get facility approval trends
    const facilityTrends = await Facility.aggregate([
      { $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get most active sports
    const activeSports = await Facility.aggregate([
      { $unwind: "$sports" },
      { $group: {
          _id: "$sports",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      // Basic stats
      totalUsers,
      totalOwners,
      totalFacilities,
      totalBookings,
      
      // Chart data
      bookingTrends,
      userTrends,
      facilityTrends,
      activeSports,
      
      // Earnings simulation (placeholder for now)
      earningsSimulation: [
        { month: 'Jan', amount: Math.floor(Math.random() * 10000) },
        { month: 'Feb', amount: Math.floor(Math.random() * 10000) },
        { month: 'Mar', amount: Math.floor(Math.random() * 10000) },
        { month: 'Apr', amount: Math.floor(Math.random() * 10000) },
        { month: 'May', amount: Math.floor(Math.random() * 10000) },
        { month: 'Jun', amount: Math.floor(Math.random() * 10000) }
      ]
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

export default r;