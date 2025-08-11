import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickcourt')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@quickcourt.com',
  password: 'admin123', // This should be changed after first login
  role: 'admin',
  otpVerified: true
};

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.disconnect();
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(adminUser.password, 10);
    
    // Create user
    const user = await User.create({
      name: adminUser.name,
      email: adminUser.email,
      passwordHash,
      role: adminUser.role,
      otpVerified: adminUser.otpVerified
    });
    
    console.log('Admin user created successfully:', user);
    console.log(`\nUse these credentials to login:\nEmail: ${adminUser.email}\nPassword: ${adminUser.password}`);
    console.log('\nIMPORTANT: Change the password after first login for security reasons.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the function
createAdminUser();