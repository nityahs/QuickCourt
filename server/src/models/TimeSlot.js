import mongoose from 'mongoose';
const TimeSlotSchema = new mongoose.Schema({
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  dateISO: String, // YYYY-MM-DD
  start: String,   // HH:mm
  end: String,     // HH:mm
  isBlocked: { type: Boolean, default: false },
  isBooked: { type: Boolean, default: false },
  priceSnapshot: Number
});
export default mongoose.model('TimeSlot', TimeSlotSchema);