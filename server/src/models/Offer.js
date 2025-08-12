import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  dateISO: String,
  start: String,
  end: String,
  originalPrice: Number,
  offeredPrice: Number,
  counterPrice: Number,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Offer', OfferSchema);