const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, default: 'other' },
  condition: { type: String, default: 'poor' },
  weight: Number,
  quantity: { type: Number, default: 1 },
  estimatedPoints: { type: Number, default: 0 }
}, { _id: false });

const VisitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, 
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
  

  email: { type: String }, 

  referenceNumber: { type: String, required: true, unique: true, index: true },
  items: [ItemSchema],

  estimatedPoints: { type: Number, default: 0 },
  pendingPoints: { type: Number, default: 0 },
  actualPoints: { type: Number, default: 0 },

  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled', 'rejected'], 
    default: 'scheduled',
    index: true 
  },

  scheduledAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledVisit', VisitSchema);