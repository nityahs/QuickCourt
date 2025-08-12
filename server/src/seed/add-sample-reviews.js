// Simple script to add sample review data for testing
// Run with: node add-sample-reviews.js

import mongoose from 'mongoose';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Facility from '../models/Facility.js';

async function addSampleReviews() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/quickcourt');
    console.log('Connected to database');

    // Find first facility and user
    const facility = await Facility.findOne();
    const user = await User.findOne();

    if (!facility || !user) {
      console.log('Need at least one facility and one user to create reviews');
      return;
    }

    console.log(`Using facility: ${facility.name} (${facility._id})`);
    console.log(`Using user: ${user.name || user.email} (${user._id})`);

    // Create sample reviews
    const sampleReviews = [
      {
        userId: user._id,
        facilityId: facility._id,
        rating: 5,
        text: 'Excellent facility! Great courts and well-maintained. Would definitely recommend to other players.'
      },
      {
        userId: user._id,
        facilityId: facility._id,
        rating: 4,
        text: 'Very good experience overall. The booking system was smooth and the courts were clean.'
      },
      {
        userId: user._id,
        facilityId: facility._id,
        rating: 3,
        text: 'Decent place to play. Could use some improvements in lighting but otherwise okay.'
      }
    ];

    // Remove existing reviews for this facility (to avoid duplicates)
    await Review.deleteMany({ facilityId: facility._id });
    console.log('Cleared existing reviews');

    // Create new reviews
    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`Created ${createdReviews.length} sample reviews`);

    // Update facility rating
    const agg = await Review.aggregate([
      { $match: { facilityId: facility._id } },
      { $group: { _id: '$facilityId', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
    ]);
    const { avg = 0, cnt = 0 } = agg[0] || {};
    await Facility.findByIdAndUpdate(facility._id, { ratingAvg: avg, ratingCount: cnt });
    console.log(`Updated facility rating: ${avg.toFixed(2)} (${cnt} reviews)`);

    console.log('Sample reviews added successfully!');
  } catch (error) {
    console.error('Error adding sample reviews:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addSampleReviews();
