const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ScheduledVisit = require('../models/ScheduledVisit');
const { authMiddleware } = require('../middleware/auth'); 

// GET /api/users/profile - Get current user stats & history
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // 1. Fetch User Data (Points, Level)
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Fetch Recycling History
    const history = await ScheduledVisit.find({ userId: req.user.userId })
      .populate('facilityId', 'name address')
      .sort({ scheduledAt: -1 }); // Newest first

    // 3. Calculate CO2 Saved (Mock logic: 1 point = 0.5kg CO2)
    const co2Saved = (user.points * 0.5).toFixed(1); 
    
    res.json({
      user,
      stats: {
        co2Saved,
        visits: history.length
      },
      history
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;