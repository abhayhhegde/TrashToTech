const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const ScheduledVisit = require('../models/ScheduledVisit');
const User = require('../models/User');

// Import middleware
const { optionalAuth, adminOnly, facilityAuthMiddleware } = require('../middleware/auth');

// ==========================================
//  PUBLIC ROUTES
//
// ==========================================

// GET /api/facilities/
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find({ status: 'active' }).lean();
    res.json(facilities);
  } catch (err) {
    console.error('GET /facilities error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/facilities/nearby
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Lat/Lng required' });

    const facilities = await Facility.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10)
        }
      },
      status: 'active'
    }).lean();

    res.json(facilities);
  } catch (err) {
    console.error('GET /nearby error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
//  ADMIN ROUTES
// ==========================================

// POST /api/facilities/add
router.post('/add', adminOnly, async (req, res) => {
  try {
    const { name, address, lng, lat, acceptedItems, operatingHours, contactInfo } = req.body;
    if (!name || !lng || !lat) return res.status(400).json({ error: 'Missing fields' });

    const facility = await Facility.create({
      name,
      address,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      acceptedItems: acceptedItems || [],
      operatingHours,
      contactInfo,
      status: 'active'
    });

    res.status(201).json({ success: true, facility });
  } catch (err) {
    console.error('POST /add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
//  FACILITY DASHBOARD ROUTES (Protected)
// ==========================================

// GET /api/facilities/dashboard
router.get('/dashboard', facilityAuthMiddleware, async (req, res) => {
  try {
    
    const authUser = req.facility || req.user;

    if (!authUser) {
        return res.status(401).json({ error: 'Authentication failed.' });
    }

  
    const facilityId = authUser.facilityId || authUser.userId; 

    if (!facilityId) {
        return res.status(401).json({ error: 'Unauthorized: No Facility ID found.' });
    }

   
    const visits = await ScheduledVisit.find({ facilityId })
      .populate('userId', 'username email phone')
      .sort({ scheduledAt: 1 });

  
    const pending = visits.filter(v => v.status === 'scheduled' || v.status === 'pending');
    const completed = visits.filter(v => v.status === 'completed');
    
    let totalItemsCollected = 0;
    completed.forEach(v => {
      if (v.items && Array.isArray(v.items)) {
         v.items.forEach(item => totalItemsCollected += (item.quantity || 1));
      }
    });

    res.json({
      stats: {
        pendingCount: pending.length,
        completedCount: completed.length,
        totalItems: totalItemsCollected
      },
      visits: visits
    });

  } catch (err) {
    console.error('Dashboard Route Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/facilities/complete-visit/:id
router.post('/complete-visit/:id', facilityAuthMiddleware, async (req, res) => {
  try {
    const authUser = req.facility || req.user;
    const currentFacilityId = authUser.facilityId || authUser.userId;

    const visit = await ScheduledVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });

    // Security Check
    if (visit.facilityId.toString() !== currentFacilityId) {
       return res.status(403).json({ error: 'Not authorized for this visit' });
    }

    if (visit.status === 'completed') {
        return res.status(400).json({ error: 'Visit already completed' });
    }

    // Update Status
    visit.status = 'completed';
    visit.completedAt = new Date();
    
    // Calculate Points
    const finalPoints = visit.estimatedPoints || 50; 
    visit.pointsAwarded = finalPoints;
    visit.actualPoints = finalPoints; // Ensure strict tracking
    
    await visit.save();

    // Award Points to User
    if (visit.userId) {
        await User.findByIdAndUpdate(visit.userId, {
            $inc: { 
                points: finalPoints,
                pendingPoints: -visit.pendingPoints 
            }
        });
    }

    res.json({ success: true, visit });
  } catch (err) {
    console.error("Complete visit error:", err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;