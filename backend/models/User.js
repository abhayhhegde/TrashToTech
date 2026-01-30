const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    lowercase: true, 
    trim: true 
  },
  passwordHash: { type: String, required: true}, 
  phone: { type: String, trim: true },

 
  points: { type: Number, default: 0, min: 0 },
  pendingPoints: { type: Number, default: 0 },
  level: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], 
    default: 'Bronze' 
  },


  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);