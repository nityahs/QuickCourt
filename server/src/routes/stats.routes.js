import { Router } from 'express';
import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
import Court from '../models/Court.js';
import { auth } from '../lib/jwt.js';
import { roleGuard } from '../lib/roleGuard.js';
const r = Router();

r.get('/user', async (req,res)=>{
  const total = await Booking.countDocuments();
  res.json({ totalBookings: total, trend: [] });
});

r.get('/owner', async (req,res)=>{
  res.json({ earnings: [], bookings: [] });
});

// New endpoint for facility owner dashboard
r.get('/facility-owner/:ownerId', auth, roleGuard('owner'), async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Verify the user is requesting their own data
    if (req.user._id.toString() !== ownerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get owner's facilities
    const facilities = await Facility.find({ ownerId });
    const facilityIds = facilities.map(f => f._id);

    // Get courts for these facilities
    const courts = await Court.find({ facilityId: { $in: facilityIds } });
    const courtIds = courts.map(c => c._id);

    // Get total bookings for owner's facilities
    const totalBookings = await Booking.countDocuments({ facilityId: { $in: facilityIds } });
    
    // Get confirmed bookings count
    const confirmedBookings = await Booking.countDocuments({ 
      facilityId: { $in: facilityIds }, 
      status: 'confirmed' 
    });

    // Get cancelled bookings count
    const cancelledBookings = await Booking.countDocuments({ 
      facilityId: { $in: facilityIds }, 
      status: 'cancelled' 
    });

    // Get completed bookings count
    const completedBookings = await Booking.countDocuments({ 
      facilityId: { $in: facilityIds }, 
      status: 'completed' 
    });

    // Calculate total earnings (sum of all confirmed and completed bookings)
    const earningsData = await Booking.aggregate([
      { $match: { 
        facilityId: { $in: facilityIds }, 
        status: { $in: ['confirmed', 'completed'] } 
      }},
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const totalEarnings = earningsData.length > 0 ? earningsData[0].total : 0;

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Booking.aggregate([
      { $match: { 
        facilityId: { $in: facilityIds }, 
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: sixMonthsAgo }
      }},
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: '$price' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Get daily booking trends for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyBookings = await Booking.aggregate([
      { $match: { 
        facilityId: { $in: facilityIds },
        createdAt: { $gte: thirtyDaysAgo }
      }},
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: '$price' }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Get peak hours data (bookings by hour)
    const peakHours = await Booking.aggregate([
      { $match: { facilityId: { $in: facilityIds } }},
      { $group: {
        _id: { $substr: ['$start', 0, 2] },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Get recent activity (last 10 bookings)
    const recentActivity = await Booking.aggregate([
      { $match: { facilityId: { $in: facilityIds } }},
      { $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }},
      { $lookup: {
        from: 'courts',
        localField: 'courtId',
        foreignField: '_id',
        as: 'court'
      }},
      { $lookup: {
        from: 'facilities',
        localField: 'facilityId',
        foreignField: '_id',
        as: 'facility'
      }},
      { $unwind: '$user' },
      { $unwind: '$court' },
      { $unwind: '$facility' },
      { $project: {
        _id: 1,
        status: 1,
        price: 1,
        start: 1,
        end: 1,
        dateISO: 1,
        createdAt: 1,
        'user.name': 1,
        'court.name': 1,
        'facility.name': 1
      }},
      { $sort: { createdAt: -1 } },
      { $limit: 10 }
    ]);

    // Get sport type distribution
    const sportDistribution = await Court.aggregate([
      { $match: { facilityId: { $in: facilityIds } }},
      { $group: {
        _id: '$sport',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      // KPI Data
      kpis: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalEarnings,
        activeCourts: courts.filter(c => c.isActive).length,
        totalFacilities: facilities.length
      },
      
      // Chart Data
      charts: {
        monthlyRevenue,
        dailyBookings,
        peakHours,
        sportDistribution
      },
      
      // Recent Activity
      recentActivity,
      
      // Facility and Court Info
      facilities: facilities.map(f => ({
        id: f._id,
        name: f.name,
        status: f.status,
        sports: f.sports,
        ratingAvg: f.ratingAvg,
        ratingCount: f.ratingCount
      })),
      
      courts: courts.map(c => ({
        id: c._id,
        name: c.name,
        sport: c.sport,
        pricePerHour: c.pricePerHour,
        isActive: c.isActive,
        facilityId: c.facilityId
      }))
    });
    
  } catch (error) {
    console.error('Error fetching facility owner stats:', error);
    res.status(500).json({ error: 'Failed to fetch facility owner statistics' });
  }
});

r.get('/admin', async (req,res)=>{
  try {
    // Basic counts
    const [totalUsers, totalFacilities, totalBookings, activeCourts] = await Promise.all([
      User.countDocuments(),
      Facility.countDocuments(),
      Booking.countDocuments(),
      Court.countDocuments({ isActive: true })
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
      activeCourts,
      
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