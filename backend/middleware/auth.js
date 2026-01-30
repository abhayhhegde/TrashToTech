const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'replace_this_secret';

// ==========================================
//  1. Standard User Authentication
//  (For User Dashboard, Scheduling, etc.)
// ==========================================
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth header' });
  
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    if (payload.type === 'facility') {
        return res.status(403).json({ error: 'Invalid token type: Users only' });
    }

    req.user = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ==========================================
//  2. Facility Authentication
//  (For Facility Dashboard operations)
// ==========================================
const facilityAuthMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth header' });
  
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    
    
    if (payload.type !== 'facility') {
      return res.status(403).json({ error: 'Access denied. Facility account required.' });
    }
    
    req.facility = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired facility token' });
  }
};

// ==========================================
//  3. Optional Authentication
//  (For public pages that show extra info if logged in)
// ==========================================
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return next();
  
  const token = auth.split(' ')[1];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, SECRET);
    if (payload.type === 'facility') {
        req.facility = payload;
    } else {
        req.user = payload;
    }
  } catch (e) {
    
  }
  return next();
};

// ==========================================
//  4. Admin Authentication
//  (For Admin Panel)
// ==========================================
const adminOnly = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    
    if (decoded.role !== 'admin') { 
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware, facilityAuthMiddleware, optionalAuth, adminOnly };