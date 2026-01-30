const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ScheduledVisit = require('../models/ScheduledVisit');
const User = require('../models/User');
const crypto = require('crypto');

// 1. IMPORT THE NEW POINT CALCULATOR 
const { calculateEstimatedPoints } = require('../utils/pointsCalculation');

// Import Middleware
const { authMiddleware, facilityAuthMiddleware } = require('../middleware/auth');

// Helper to generate "TT-XXXX" Reference IDs
function generateReference() {
  return 'TT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}


router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    const { items, facilityId } = req.body; 

    // Validation
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items array required' });
    if (!facilityId) return res.status(400).json({ error: 'Facility ID required' });

    const userId = req.user.userId || req.user.id || req.user._id;
    if (!userId) {
        return res.status(400).json({ error: 'User identification failed. Please relogin.' });
    }
    
    // 2. CALCULATOR
    const totalEstimated = calculateEstimatedPoints(items);

    // 30% Upfront Logic
    const pendingPoints = Math.floor(totalEstimated * 0.30); 
    const referenceNumber = generateReference();

    // Create Visit
    const visit = await ScheduledVisit.create({
      userId: userId,
      facilityId,
      referenceNumber,
      items: items, // Save items exactly as sent
      estimatedPoints: totalEstimated,
      pendingPoints,
      status: 'scheduled' 
    });

    // Add Pending Points to User
    if (pendingPoints > 0) {
      await User.findByIdAndUpdate(userId, { $inc: { pendingPoints: pendingPoints } });
    }

    res.status(201).json({ 
        success: true, 
        referenceNumber, 
        estimatedPoints: totalEstimated, 
        pendingPoints, 
        visitId: visit._id 
    });

  } catch (err) {
    console.error('Schedule Error:', err);
    res.status(500).json({ error: 'Server error during scheduling' });
  }
});


router.post('/confirm', facilityAuthMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { referenceNumber, action } = req.body;
    const visit = await ScheduledVisit.findOne({ referenceNumber }).session(session);

    if (!visit) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    // Prevent double processing
    if (visit.status === 'completed' || visit.status === 'rejected') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Visit already processed' });
    }

    // --- REJECT ACTION ---
    if (action === 'reject') {
      visit.status = 'rejected';
      visit.completedAt = new Date();
      await visit.save({ session });

      // Revoke the 30% pending points
      if (visit.userId) {
        await User.findByIdAndUpdate(visit.userId, { 
          $inc: { pendingPoints: -visit.pendingPoints } 
        }, { session });
      }
      await session.commitTransaction();
      return res.json({ message: 'Visit rejected' });
    }

    // --- ACCEPT ACTION ---
    // 
    if (action === 'accept') {
        const finalPoints = visit.estimatedPoints;
        
        visit.status = 'completed';
        visit.actualPoints = finalPoints;
        visit.completedAt = new Date();
        await visit.save({ session });

        if (visit.userId) {
            // Logic: 
            // 1. Add Full Points to 'points' (Spendable)
            // 2. Remove the temporary 'pendingPoints'
            
            
            await User.findByIdAndUpdate(visit.userId, {
                $inc: { 
                    points: finalPoints, 
                    pendingPoints: -visit.pendingPoints 
                }
            }, { session });
        }

        await session.commitTransaction();
        res.json({ success: true, points: finalPoints });
    }

  } catch (err) {
    await session.abortTransaction();
    console.error('Confirm Error:', err);
    res.status(500).json({ error: 'Transaction failed' });
  } finally {
    session.endSession();
  }
});

module.exports = router;