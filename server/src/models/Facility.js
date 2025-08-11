import 'dotenv/config';
import mongoose from 'mongoose';
const FacilitySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  description: String,
  address: String,
  geolocation: { 
    lat: Number, 
    lng: Number,
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat] for MongoDB geospatial queries
  },
  sports: [String],
  amenities: [String],
  photos: [String],
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  startingPricePerHour: { type: Number, default: 0 },
  highlight: { type: Boolean, default: false }
}, { timestamps: true });

// Add geospatial index for location-based queries
FacilitySchema.index({ geolocation: '2dsphere' });

// Pre-save middleware to set coordinates from lat/lng
FacilitySchema.pre('save', function(next) {
  if (this.geolocation && this.geolocation.lat && this.geolocation.lng) {
    this.geolocation.coordinates = [this.geolocation.lng, this.geolocation.lat];
  }
  next();
});

// Use env override to match Atlas collection name if it's 'venues'
const collectionName = process.env.FACILITIES_COLLECTION || 'facilities';
export default mongoose.model('Facility', FacilitySchema, collectionName);