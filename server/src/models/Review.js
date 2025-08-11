import mongoose from 'mongoose';
const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  rating: Number,
  text: String
}, { timestamps: true });
export default mongoose.model('Review', ReviewSchema);