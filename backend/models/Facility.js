// backend/models/Facility.js
const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // for facility login
  passwordHash: { type: String }, 
  address: { type: String, default: '' },
  capacity: { type: Number, default: null },
  acceptedItems: { type: [String], default: [] },
  operatingHours: { type: String, default: '' },
  contactInfo: { type: String, default: '' },
  certifications: { type: [String], default: [] },
  rating: { type: Number, default: 4 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  source: { type: String, default: 'CPCB' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  createdAt: { type: Date, default: Date.now }
});

// 2dsphere index for geospatial queries
FacilitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Facility', FacilitySchema);
