import mongoose from 'mongoose';
import User from '../models/User.js';
import Facility from '../models/Facility.js';

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/quickcourt');
    
    const users = await User.countDocuments();
    const facilities = await Facility.countDocuments();
    
    console.log(`Users: ${users}, Facilities: ${facilities}`);
    
    if (users > 0) {
      const sampleUser = await User.findOne();
      console.log('Sample user:', { id: sampleUser._id, name: sampleUser.name, email: sampleUser.email });
    }
    
    if (facilities > 0) {
      const sampleFacility = await Facility.findOne();
      console.log('Sample facility:', { id: sampleFacility._id, name: sampleFacility.name });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();
