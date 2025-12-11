const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  points: { type: Number, default: 0 },
  pendingPoints: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze' },
  recyclingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledVisit' }],
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);