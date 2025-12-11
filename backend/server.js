
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Facility = require('./models/Facility');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trash_to_tech';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ---- Auth endpoints (secure) ----
app.post('/register', async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, phone, passwordHash });
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT (valid for e.g., 7 days)
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'replace_this_secret', { expiresIn: '7d' });
    res.json({ token, email: user.email, username: user.username || user.email.split('@')[0] });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---- Facility Auth endpoints ----
app.post('/facility/register', async (req, res) => {
  try {
    const { name, email, password, address, contactInfo, acceptedItems, operatingHours, coordinates } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }

    // Check if facility email already exists
    const existing = await Facility.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Facility email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create facility
    const facility = await Facility.create({
      name,
      email,
      passwordHash,
      address: address || '',
      contactInfo: contactInfo || '',
      acceptedItems: acceptedItems || [],
      operatingHours: operatingHours || '',
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0] // [lng, lat]
      },
      status: 'active',
      source: 'Self-Registered'
    });

    res.status(201).json({
      message: 'Facility registered successfully',
      facilityId: facility._id
    });
  } catch (err) {
    console.error('facility register error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/facility/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const facility = await Facility.findOne({ email });
    if (!facility) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!facility.passwordHash) {
      return res.status(401).json({ error: 'Facility not set up for login. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, facility.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT for facility
    const token = jwt.sign(
      {
        facilityId: facility._id,
        email: facility.email,
        name: facility.name,
        type: 'facility'
      },
      process.env.JWT_SECRET || 'replace_this_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      email: facility.email,
      name: facility.name,
      facilityId: facility._id
    });
  } catch (err) {
    console.error('facility login error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple middleware to protect routes
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_secret');
    req.user = payload; // { userId, email, iat, exp } or { facilityId, email, type: 'facility' }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/user/me - Get current logged-in user's data
app.get('/api/user/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user._id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      phone: user.phone,
      points: user.points,
      pendingPoints: user.pendingPoints,
      level: user.level,
      joinedAt: user.joinedAt
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to protect facility-only routes
function facilityAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_secret');
    if (payload.type !== 'facility') {
      return res.status(403).json({ error: 'Facility access only' });
    }
    req.facility = payload; // { facilityId, email, name, type: 'facility' }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


// require('./routes/visit')(app) or app.use('/api/visit', require('./routes/visit'));
app.use('/api/visit', require('./routes/visit'));
app.use('/api/facilities', require('./routes/facilities'));

// small user profile example
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-passwordHash');
  res.json(user);
});

// GET /api/user/stats - Get user statistics for dashboard
app.get('/api/user/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('recyclingHistory');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ScheduledVisit = require('./models/ScheduledVisit');

    // Get completed visits
    const completedVisits = await ScheduledVisit.find({
      email: user.email,
      status: 'completed'
    }).lean();

    // Calculate total items recycled
    let totalItems = 0;
    let totalCO2Reduction = 0;
    const itemsByCategory = {};

    completedVisits.forEach(visit => {
      visit.items.forEach(item => {
        totalItems += item.quantity || 1;
        // Estimate CO2 reduction: 1kg = ~10kg CO2 saved
        totalCO2Reduction += (item.weight || 0) * 10;

        const category = item.category || 'other';
        if (!itemsByCategory[category]) {
          itemsByCategory[category] = {
            count: 0,
            co2: 0
          };
        }
        itemsByCategory[category].count += item.quantity || 1;
        itemsByCategory[category].co2 += (item.weight || 0) * 10;
      });
    });

    return res.json({
      totalItems,
      totalPoints: user.points,
      pendingPoints: user.pendingPoints,
      level: user.level,
      totalCO2Reduction: Math.round(totalCO2Reduction),
      itemsByCategory,
      totalVisits: completedVisits.length
    });
  } catch (err) {
    console.error('stats error', err);
    return res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// GET /api/user/history - Get user's recycling history
app.get('/api/user/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ScheduledVisit = require('./models/ScheduledVisit');

    const visits = await ScheduledVisit.find({ email: user.email })
      .populate('facilityId', 'name address')
      .sort({ scheduledAt: -1 })
      .limit(50)
      .lean();

    return res.json(visits);
  } catch (err) {
    console.error('history error', err);
    return res.status(500).json({ error: 'Server error fetching history' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server listening ${PORT}`));
