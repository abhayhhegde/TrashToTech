// backend/routes/visit.js
const express = require('express');
const router = express.Router();
const ScheduledVisit = require('../models/ScheduledVisit');
const Facility = require('../models/Facility');
const QRCode = require('qrcode');
const crypto = require('crypto');

// condition multipliers
const conditionMultiplier = {
  good: 1.5,
  moderate: 1.2,
  poor: 1.0
};

function calculateItemPoints(item) {
  const weight = Number(item.weight) || 0;
  const base = weight * 10;
  const mult = conditionMultiplier[(item.condition || '').toLowerCase()] || 1.0;
  return Math.round(base * mult);
}

function generateReference() {
  return 'TT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function parseItems(raw) {
  if (!raw) return null;

  
  if (Array.isArray(raw)) return raw;

  
  if (typeof raw === 'object') {
    // check if keys are numeric indexes
    const idxKeys = Object.keys(raw).filter(k => /^\d+$/.test(k));
    if (idxKeys.length > 0) {
      // build array using numeric keys sorted
      return idxKeys.sort((a, b) => Number(a) - Number(b)).map(k => raw[k]);
    }
    
    return [raw];
  }

  // If string: try JSON.parse
  if (typeof raw === 'string') {
    
    if (raw === '[object Object]') return null;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object') return [parsed];
    } catch (e) {
 
      return null;
    }
  }

  return null;
}

// POST /api/visit/schedule
router.post('/schedule', async (req, res) => {
  try {

    const rawItems = req.body.items || req.body['items[]'] || req.body['items'];
    const items = parseItems(rawItems);

    const facilityId = req.body.facilityId || req.body.facility_id || req.body.facility;

    const userLocation = req.body.userLocation || req.body.user_location || null;

    // Get user info from JWT token if available
    const User = require('../models/User');
    let userId = req.user ? req.user.userId : null;
    let email = req.user ? req.user.email : null;

    // If authenticated, fetch user and update email
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        email = user.email;
      }
    } 

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items are required and must be an array' });
    }
    if (!facilityId) {
      return res.status(400).json({ error: 'facilityId is required' });
    }

    // validate facility
    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    // compute points per item
    let estimatedPoints = 0;
    const processedItems = items.map(it => {
      // tolerate both camelCase and snake_case from client
      const item = {
        itemName: it.itemName || it.item_name || it.name || '',
        category: it.category || it.type || 'other',
        condition: it.condition || it.state || 'poor',
        weight: Number(it.weight || it.wt || 0),
        quantity: Number(it.quantity || 1)
      };

      const pts = calculateItemPoints(item) * (item.quantity || 1);
      estimatedPoints += pts;
      return { ...item, estimatedPoints: pts };
    });

    const pendingPoints = Math.round(estimatedPoints * 0.30); // 30% credited immediately

    const referenceNumber = generateReference();

    // QR payload — minimal info
    const qrPayload = {
      type: 'recycle_visit',
      referenceNumber,
      facilityId: facility._id.toString()
    };
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));

    const visitDoc = {
      userId: userId || null,
      email: email || null,
      facilityId: facility._id,
      referenceNumber,
      items: processedItems,
      estimatedPoints,
      pendingPoints,
      actualPoints: 0,
      status: 'scheduled',
      qrCodeDataUrl: qrDataUrl,
      scheduledAt: new Date()
    };

    const visit = await ScheduledVisit.create(visitDoc);

    // Credit pending points to user immediately (30% upfront)
    if (userId && pendingPoints > 0) {
      const user = await User.findById(userId);
      if (user) {
        user.pendingPoints += pendingPoints;
        await user.save();
      }
    }

    return res.json({
      referenceNumber,
      estimatedPoints,
      pendingPoints,
      qrDataUrl,
      visitId: visit._id
    });
  } catch (err) {
    console.error('schedule error', err);
    
    if (err && err.message && err.message.includes('Unexpected token')) {
      return res.status(400).json({ error: 'Invalid JSON in items payload' });
    }
    return res.status(500).json({ error: 'Server error scheduling visit' });
  }
});

// POST /api/visit/confirm - Admin confirms visit and awards points
router.post('/confirm', async (req, res) => {
  try {
    const { referenceNumber, action, actualItems } = req.body;

    if (!referenceNumber) {
      return res.status(400).json({ error: 'referenceNumber is required' });
    }
    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be "accept" or "reject"' });
    }

    // Find the visit by reference number
    const visit = await ScheduledVisit.findOne({ referenceNumber });
    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    if (visit.status === 'completed' || visit.status === 'cancelled') {
      return res.status(400).json({ error: `Visit already ${visit.status}` });
    }

    // Get user if email is linked
    const User = require('../models/User');
    let user = null;
    if (visit.email) {
      user = await User.findOne({ email: visit.email });
    } else if (visit.userId) {
      user = await User.findById(visit.userId);
    }

    if (action === 'accept') {
      // Calculate actual points based on actualItems if provided
      let finalPoints = visit.estimatedPoints;
      if (actualItems && Array.isArray(actualItems) && actualItems.length > 0) {
        finalPoints = 0;
        actualItems.forEach(item => {
          const pts = calculateItemPoints(item) * (item.quantity || 1);
          finalPoints += pts;
        });
        finalPoints = Math.round(finalPoints);
      }

      // Update visit status
      visit.status = 'completed';
      visit.actualPoints = finalPoints;
      visit.completedAt = new Date();
      await visit.save();

      // Award points to user (remaining 70% + any pending)
      if (user) {
        const remainingPoints = finalPoints - visit.pendingPoints;
        user.points += remainingPoints;
        user.pendingPoints = Math.max(0, user.pendingPoints - visit.pendingPoints);

        // Add to recycling history
        if (!user.recyclingHistory.includes(visit._id)) {
          user.recyclingHistory.push(visit._id);
        }

        // Update user level based on points
        if (user.points >= 5000) {
          user.level = 'Platinum';
        } else if (user.points >= 2000) {
          user.level = 'Gold';
        } else if (user.points >= 500) {
          user.level = 'Silver';
        } else {
          user.level = 'Bronze';
        }

        await user.save();

        return res.json({
          message: 'Visit confirmed and points awarded',
          visit,
          userPoints: user.points,
          userLevel: user.level,
          pointsAwarded: remainingPoints
        });
      } else {
        return res.json({
          message: 'Visit confirmed but no user found to award points',
          visit
        });
      }
    } else if (action === 'reject') {
      // Reject the visit
      visit.status = 'cancelled';
      visit.completedAt = new Date();
      await visit.save();

      // Remove pending points from user
      if (user) {
        user.pendingPoints = Math.max(0, user.pendingPoints - visit.pendingPoints);
        await user.save();

        return res.json({
          message: 'Visit rejected and pending points removed',
          visit,
          userPoints: user.points
        });
      } else {
        return res.json({
          message: 'Visit rejected but no user found',
          visit
        });
      }
    }
  } catch (err) {
    console.error('confirm error', err);
    return res.status(500).json({ error: 'Server error confirming visit' });
  }
});

// GET /api/visit/history?email=...  - Get user's visit history
router.get('/history', async (req, res) => {
  try {
    const email = req.query.email || (req.user && req.user.email);

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const visits = await ScheduledVisit.find({ email })
      .populate('facilityId', 'name address')
      .sort({ scheduledAt: -1 })
      .lean();

    return res.json(visits);
  } catch (err) {
    console.error('history error', err);
    return res.status(500).json({ error: 'Server error fetching history' });
  }
});

// GET /api/visit/details/:referenceNumber - Get visit details by reference number
router.get('/details/:referenceNumber', async (req, res) => {
  try {
    const { referenceNumber } = req.params;

    if (!referenceNumber) {
      return res.status(400).json({ error: 'Reference number is required' });
    }

    const visit = await ScheduledVisit.findOne({ referenceNumber })
      .populate('facilityId', 'name address contactInfo')
      .lean();

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    return res.json(visit);
  } catch (err) {
    console.error('visit details error', err);
    return res.status(500).json({ error: 'Server error fetching visit details' });
  }
});

module.exports = router;
