import mongoose from 'mongoose';
const CouponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  type: { type: String, enum: ['flat','percent'] },
  value: Number,
  minBookings: { type: Number, default: 0 },
  maxRedemptions: { type: Number, default: 100 },
  redeemed: { type: Number, default: 0 },
  validFrom: Date,
  validTo: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
export default mongoose.model('Coupon', CouponSchema);