const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path matches your project structure
const { authMiddleware } = require('../middleware/auth');
const crypto = require('crypto'); // Built-in Node module for random codes

// POST /api/rewards/redeem
router.post('/redeem', authMiddleware, async (req, res) => {
  try {
    const { cost, name } = req.body;
    const userId = req.user.userId; // Got from the Token

    // 1. Find the User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. SAFETY CHECK: Can they afford it?
    if (user.points < cost) {
      return res.status(400).json({ error: 'Insufficient points. Keep recycling!' });
    }

    // 3. THE TRANSACTION (Deduct Points)
    user.points -= cost;
    
    // 4. Generate a unique Voucher Code (e.g., AMZN-A1B2-C3D4)
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const prefix = name.substring(0, 3).toUpperCase(); // e.g., "AMA" for Amazon
    const voucherCode = `${prefix}-${randomCode}`;

    // 5. Save to Database
    await user.save();

    // 6. Send success response
    res.json({ 
      success: true, 
      newBalance: user.points, 
      code: voucherCode,
      message: `Successfully redeemed ${name}!`
    });

    console.log(`Transaction Success: User ${user.email} spent ${cost} pts on ${name}`);

  } catch (err) {
    console.error("Redemption Error:", err);
    res.status(500).json({ error: 'Transaction failed on server.' });
  }
});

module.exports = router;