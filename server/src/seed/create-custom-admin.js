import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas with explicit database name
mongoose.connect(process.env.MONGO_URI, { dbName: 'quickcourt' })
  .then(() => console.log('MongoDB Atlas connected to quickcourt database'))
  .catch(err => console.error('MongoDB connection error:', err));

// Custom admin user data - CHANGE THESE VALUES
const customAdmin = {
  name: 'admin',  // Change this to your preferred admin name
  email: 'admin@gmail.com',  // Change this to your preferred email
  password: 'Pass@123',  // Change this to a secure password
  role: 'admin',
  otpVerified: true
};

// Create custom admin user
async function createCustomAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: customAdmin.email });
    
    if (existingAdmin) {
      console.log('Admin user with this email already exists');
      mongoose.disconnect();
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(customAdmin.password, 10);
    
    // Create user in the quickcourt.users collection
    const user = await User.create({
      name: customAdmin.name,
      email: customAdmin.email,
      passwordHash,
      role: customAdmin.role,
      otpVerified: customAdmin.otpVerified
    });
    
    console.log('Custom admin user created successfully:', user);
    console.log(`\nUse these credentials to login:\nEmail: ${customAdmin.email}\nPassword: ${customAdmin.password}`);
    console.log('\nIMPORTANT: Change the password after first login for security reasons.');
  } catch (error) {
    console.error('Error creating custom admin user:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the function
createCustomAdmin();