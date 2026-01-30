const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


dotenv.config();

// Import Models
const User = require('./models/User');
const Facility = require('./models/Facility');
const ScheduledVisit = require('./models/ScheduledVisit'); 
const rewardRoutes = require('./routes/rewards');
const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trash_to_tech';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Cluster Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ==========================================
//  AUTH ROUTES (USER)
// ==========================================

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({ username, email, phone, passwordHash });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'User data corrupted (No Password Set). Please register again.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, type: 'user' }, 
      process.env.JWT_SECRET || 'replace_this_secret', 
      { expiresIn: '7d' }
    );
    
    res.json({ token, email: user.email, username: user.username || user.email.split('@')[0], type: 'user' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
//  AUTH ROUTES (FACILITY)
//  Prefix: /api/facility
// ==========================================

// POST /api/facility/register
app.post('/api/facility/register', async (req, res) => {
  try {
    const { name, email, password, address, contactInfo, acceptedItems, operatingHours, coordinates } = req.body;

    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });

    const existing = await Facility.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Facility email already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

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
        coordinates: (coordinates && coordinates.length === 2) ? coordinates : [0, 0] 
      },
      status: 'active',
      source: 'Self-Registered'
    });

    res.status(201).json({ message: 'Facility registered successfully', facilityId: facility._id });
  } catch (err) {
    console.error('Facility Register Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/facility/login
app.post('/api/facility/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const facility = await Facility.findOne({ email });
    if (!facility) return res.status(401).json({ error: 'Invalid credentials' });

    if (!facility.passwordHash) {
      return res.status(401).json({ error: 'Facility not set up for login. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, facility.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { facilityId: facility._id, email: facility.email, name: facility.name, type: 'facility' },
      process.env.JWT_SECRET || 'replace_this_secret',
      { expiresIn: '7d' }
    );

    res.json({ token, email: facility.email, name: facility.name, facilityId: facility._id, type: 'facility' });
  } catch (err) {
    console.error('Facility Login Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
//  MIDDLEWARE
// ==========================================

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth header' });
  
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_secret');
    req.user = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ==========================================
//  USER DATA ROUTES
//  Prefix: /api/user
// ==========================================

// GET /api/user/me
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
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/user/profile
app.get('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get completed visits for stats
        const completedVisits = await ScheduledVisit.find({ email: user.email, status: 'completed' }).lean();
        
        // Calculate basic stats for profile view
        let totalItems = 0;
        let co2Saved = 0;
        completedVisits.forEach(v => {
            v.items.forEach(i => {
                totalItems += (i.quantity || 1);
                co2Saved += (i.weight || 0) * 10;
            });
        });

        // Get recent history (all visits)
        const history = await ScheduledVisit.find({ email: user.email })
            .populate('facilityId', 'name address')
            .sort({ scheduledAt: -1 })
            .limit(10)
            .lean();

        res.json({ 
            user, 
            stats: { totalItems, co2Saved }, 
            history 
        });
    } catch(err) {
        console.error("Profile Error", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/user/stats
app.get('/api/user/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const completedVisits = await ScheduledVisit.find({ email: user.email, status: 'completed' }).lean();

    let totalItems = 0;
    let totalCO2Reduction = 0;
    const itemsByCategory = {};

    completedVisits.forEach(visit => {
      visit.items.forEach(item => {
        const qty = item.quantity || 1;
        totalItems += qty;
        totalCO2Reduction += (item.weight || 0) * 10;

        const category = item.category || 'other';
        if (!itemsByCategory[category]) itemsByCategory[category] = { count: 0, co2: 0 };
        itemsByCategory[category].count += qty;
        itemsByCategory[category].co2 += (item.weight || 0) * 10;
      });
    });

    res.json({
      totalItems,
      totalPoints: user.points,
      pendingPoints: user.pendingPoints,
      level: user.level,
      totalCO2Reduction: Math.round(totalCO2Reduction),
      itemsByCategory,
      totalVisits: completedVisits.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/user/history
app.get('/api/user/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const visits = await ScheduledVisit.find({ email: user.email })
      .populate('facilityId', 'name address')
      .sort({ scheduledAt: -1 })
      .limit(50)
      .lean();

    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
//  EXTERNAL ROUTE MODULES
// ==========================================
app.use('/api/users', require('./routes/users'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/visit', require('./routes/visit'));
app.use('/api/rewards', require('./routes/rewards'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));