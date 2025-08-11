import mongoose from 'mongoose';
const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  dateISO: String,
  start: String,
  end: String,
  price: Number,
  status: { type: String, enum: ['confirmed','cancelled','completed'], default: 'confirmed' },
  payment: { method: { type: String, default: 'simulated' }, txnId: String },
}, { timestamps: true });
export default mongoose.model('Booking', BookingSchema);