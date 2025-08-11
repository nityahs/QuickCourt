import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  name: String,
  fullName: String, // Adding fullName field for client compatibility
  email: { type: String, unique: true },
  passwordHash: String,
  avatar: String,
  role: { type: String, enum: ['user','owner','admin','facility_owner'], default: 'user' },
  phone: String,
  otp: String,
  otpExpiresAt: Date, // OTP expiration timestamp
  otpVerified: { type: Boolean, default: false },
  reliabilityScore: { type: Number, default: 80 },
  cancellations: { type: Number, default: 0 },
  favorites: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' } ],
  banned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('User', UserSchema);