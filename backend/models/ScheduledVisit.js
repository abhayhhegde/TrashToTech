// backend/models/ScheduledVisit.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemName: String,
  category: String,
  condition: String,
  weight: Number,
  quantity: { type: Number, default: 1 },
  estimatedPoints: { type: Number, default: 0 }
}, { _id: false });

const VisitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional
  email: { type: String, required: false }, // fallback if no auth
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  referenceNumber: { type: String, required: true, unique: true },
  items: [ItemSchema],
  estimatedPoints: { type: Number, default: 0 },
  pendingPoints: { type: Number, default: 0 }, // credited now (30%)
  actualPoints: { type: Number, default: 0 },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  qrCodeDataUrl: { type: String, default: '' },
  scheduledAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledVisit', VisitSchema);
