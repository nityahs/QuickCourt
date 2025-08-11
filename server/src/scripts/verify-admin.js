import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas with explicit database name
mongoose.connect(process.env.MONGO_URI, { dbName: 'quickcourt' })
  .then(() => console.log('MongoDB Atlas connected to quickcourt database'))
  .catch(err => console.error('MongoDB connection error:', err));

// Verify admin users
async function verifyAdminUsers() {
  try {
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('-passwordHash');
    
    console.log('\n===== ADMIN USERS IN DATABASE =====');
    if (adminUsers.length === 0) {
      console.log('No admin users found in the database!');
      console.log('Please run the create-custom-admin.js script to create an admin user.');
    } else {
      console.log(`Found ${adminUsers.length} admin users:`);
      adminUsers.forEach((admin, index) => {
        console.log(`\nAdmin User #${index + 1}:`);
        console.log(`- ID: ${admin._id}`);
        console.log(`- Name: ${admin.name}`);
        console.log(`- Email: ${admin.email}`);
        console.log(`- Role: ${admin.role}`);
        console.log(`- OTP Verified: ${admin.otpVerified}`);
        console.log(`- Created At: ${admin.createdAt}`);
      });
    }
    
    // Check if there are any users with incorrect role format
    const allUsers = await User.find();
    const incorrectRoleUsers = allUsers.filter(user => 
      !['user', 'owner', 'admin'].includes(user.role)
    );
    
    if (incorrectRoleUsers.length > 0) {
      console.log('\n===== USERS WITH INCORRECT ROLE FORMAT =====');
      console.log(`Found ${incorrectRoleUsers.length} users with incorrect role format:`);
      incorrectRoleUsers.forEach((user, index) => {
        console.log(`\nUser #${index + 1}:`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: ${user.role} (should be 'user', 'owner', or 'admin')`);
      });
    }
    
    console.log('\n===== DATABASE CONNECTION INFO =====');
    console.log(`Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`Connected to: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (error) {
    console.error('Error verifying admin users:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the function
verifyAdminUsers();