import mongoose from 'mongoose';
const FacilitySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  description: String,
  address: String,
  geolocation: { lat: Number, lng: Number },
  sports: [String],
  amenities: [String],
  photos: [String],
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  startingPricePerHour: { type: Number, default: 0 },
  highlight: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Facility', FacilitySchema);