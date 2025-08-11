import mongoose from 'mongoose';
const PriceEventSchema = new mongoose.Schema({
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  timestamp: { type: Date, default: Date.now },
  price: Number
});
export default mongoose.model('PriceEvent', PriceEventSchema);