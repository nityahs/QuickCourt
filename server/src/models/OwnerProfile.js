import mongoose from 'mongoose';
const OwnerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  orgName: String,
  kycStatus: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  highlightCredits: { type: Number, default: 0 }
});
export default mongoose.model('OwnerProfile', OwnerProfileSchema);