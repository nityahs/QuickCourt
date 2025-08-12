import mongoose from 'mongoose';
const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  dateISO: String,
  start: String,
  end: String,
  price: Number,
  basePrice: Number,
  isNegotiated: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  payment: { 
    method: { type: String, default: 'stripe' }, 
    txnId: String,
    paymentIntentId: String,
    clientSecret: String,
    status: String,
    amount: Number
  },
  confirmedAt: Date,
}, { timestamps: true });
export default mongoose.model('Booking', BookingSchema);