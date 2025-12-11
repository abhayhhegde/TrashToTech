// backend/routes/facilities.js
const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const jwt = require('jsonwebtoken');

// optional auth: allows public nearby queries but attaches user if token present
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next();
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_secret');
  } catch (e) { /* ignore */ }
  return next();
}

// adminOnly: require valid token (improve by checking user role in production)
function adminOnly(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth header' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_secret');
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find({ status: 'active' }).lean();
    res.json(facilities);
  } catch (err) {
    console.error('GET /api/facilities error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/facilities/nearby?lat=..&lng=..&radius=meters
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat & lng required' });

    const facilities = await Facility.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10)
        }
      },
      status: 'active'
    }).lean();

    res.json(facilities);
  } catch (err) {
    console.error('GET /api/facilities/nearby error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/facilities/add
 * protected admin endpoint to add facility
 * body: { name, address, lng, lat, acceptedItems, operatingHours, contactInfo }
 */
router.post('/add', adminOnly, async (req, res) => {
  try {
    const { name, address, lng, lat, acceptedItems = [], operatingHours = '', contactInfo = '', certifications = [], rating = 4 } = req.body;
    if (!name || typeof lng === 'undefined' || typeof lat === 'undefined') return res.status(400).json({ error: 'name, lng, lat required' });

    const facility = await Facility.create({
      name,
      address,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      acceptedItems,
      operatingHours,
      contactInfo,
      certifications,
      rating,
      status: 'active'
    });

    res.json({ success: true, facility });
  } catch (err) {
    console.error('facilities.add err', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/facilities/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const f = await Facility.findById(req.params.id);
    if (!f) return res.status(404).json({ error: 'Not found' });
    res.json(f);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
