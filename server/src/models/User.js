import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  avatar: String,
  role: { type: String, enum: ['user','owner','admin'], default: 'user' },
  phone: String,
  otp: String,
  otpVerified: { type: Boolean, default: false },
  reliabilityScore: { type: Number, default: 80 },
  cancellations: { type: Number, default: 0 },
  favorites: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' } ],
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('User', UserSchema);