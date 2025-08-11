import mongoose from 'mongoose';
const CourtSchema = new mongoose.Schema({
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  name: String,
  sport: String,
  pricePerHour: Number,
  operatingHours: { open: String, close: String },
  isActive: { type: Boolean, default: true }
});
export default mongoose.model('Court', CourtSchema);