# Session Management and Username Display Fix

## Issues Fixed

### 1. Username Showing "undefined"
**Problem**: The navbar was showing "undefined" instead of the actual username from the database.

**Root Cause**:
- Login endpoint returned username but it wasn't always set in the User model
- Frontend was storing username in localStorage but not fetching fresh data from database
- No API endpoint existed to fetch current user's data

**Solution**:
- Created new `/api/user/me` endpoint to fetch current user data from database
- Navbar now fetches username dynamically from the API on every page navigation
- Falls back to email prefix if username field is empty in database

### 2. JWT Persisting After Browser Close
**Problem**: User remained logged in even after closing the browser window/tab and reopening.

**Root Cause**:
- Using `localStorage` which persists indefinitely until manually cleared
- JWT tokens were not expiring on browser close

**Solution**:
- Switched from `localStorage` to `sessionStorage` throughout the application
- sessionStorage automatically clears when browser tab/window closes
- Both user and facility authentication now use sessionStorage

---

## Changes Made

### Backend Changes

#### 1. New API Endpoint: `/api/user/me`
**File**: `backend/server.js` (lines 169-189)

```javascript
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
```

**Features**:
- Protected route (requires JWT token)
- Returns user data excluding password hash
- Falls back to email prefix if username field is empty
- Used by frontend to get current user information

---

### Frontend Changes

#### 1. API Interceptor Update
**File**: `frontend/src/api/http.js` (line 14)

**Before**:
```javascript
const token = localStorage.getItem('authToken');
```

**After**:
```javascript
const token = sessionStorage.getItem('authToken');
```

**Impact**: All API requests now use token from sessionStorage

---

#### 2. Login Page Update
**File**: `frontend/src/pages/Login.jsx` (lines 20-23)

**Before**:
```javascript
const { token, email, username } = response.data;
localStorage.setItem('authToken', token);
localStorage.setItem('email', email);
localStorage.setItem('username', username);
```

**After**:
```javascript
const { token } = response.data;
sessionStorage.setItem('authToken', token);
```

**Changes**:
- Only stores JWT token (no email or username)
- Uses sessionStorage instead of localStorage
- User data fetched from API when needed

---

#### 3. Navbar Component - Major Overhaul
**File**: `frontend/src/components/Navbar.jsx`

**Key Changes**:

1. **Import API client** (line 3):
```javascript
import API from '../api/http';
```

2. **Fetch user data from API** (lines 14-36):
```javascript
useEffect(() => {
  const fetchUserData = async () => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const response = await API.get('/api/user/me');
        setIsLoggedIn(true);
        setUsername(response.data.username);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        // Token invalid or expired, clear it
        sessionStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setUsername('');
      }
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  };

  fetchUserData();
}, [location]);
```

3. **Updated logout handler** (lines 57-62):
```javascript
const handleLogout = () => {
  sessionStorage.removeItem('authToken');
  setIsLoggedIn(false);
  setUsername('');
  navigate('/login');
};
```

**Benefits**:
- Fetches real username from database
- Validates token on every page navigation
- Automatically logs out on invalid/expired token
- Shows correct username from database

---

#### 4. Protected Route Component
**File**: `frontend/src/components/ProtectedRoute.jsx` (line 6)

**Before**:
```javascript
const token = localStorage.getItem('authToken');
```

**After**:
```javascript
const token = sessionStorage.getItem('authToken');
```

---

#### 5. RecyclePage Component
**File**: `frontend/src/pages/RecyclePage.jsx` (line 165)

**Before**:
```javascript
const token = localStorage.getItem('authToken');
```

**After**:
```javascript
const token = sessionStorage.getItem('authToken');
```

---

#### 6. Facility Login Page
**File**: `frontend/src/pages/FacilityLogin.jsx` (lines 20-24)

**Before**:
```javascript
localStorage.setItem('facilityToken', token);
localStorage.setItem('facilityEmail', email);
localStorage.setItem('facilityName', name);
localStorage.setItem('facilityId', facilityId);
```

**After**:
```javascript
sessionStorage.setItem('facilityToken', token);
sessionStorage.setItem('facilityEmail', email);
sessionStorage.setItem('facilityName', name);
sessionStorage.setItem('facilityId', facilityId);
```

---

#### 7. Facility Confirm Page
**File**: `frontend/src/pages/FacilityConfirm.jsx`

**Changes**:
- Line 20: `sessionStorage.getItem('facilityToken')`
- Line 121: `sessionStorage.getItem('facilityToken')`
- Line 140: `sessionStorage.getItem('facilityName')`
- Lines 152-155: `sessionStorage.removeItem()` for all facility data

---

## Testing Checklist

### Username Display Test
1. ✅ Login with existing user account
2. ✅ Check navbar shows actual username (not "undefined")
3. ✅ Navigate to different pages (Dashboard, About, Contact)
4. ✅ Verify username persists across page navigation
5. ✅ Check users without username field show email prefix

### Session Expiration Test
1. ✅ Login to user account
2. ✅ Verify you're logged in (see username in navbar)
3. ✅ Close browser tab/window completely
4. ✅ Reopen browser and navigate to the app
5. ✅ Verify you're logged out (no username, redirected to login)

### Facility Session Test
1. ✅ Login to facility account
2. ✅ Close browser tab/window
3. ✅ Reopen and try to access `/facility/confirm`
4. ✅ Verify redirected to facility login page

### Token Validation Test
1. ✅ Login with user account
2. ✅ Manually clear sessionStorage in browser DevTools
3. ✅ Try to access Dashboard
4. ✅ Verify redirected to login page

---

## How It Works Now

### User Login Flow:
1. User enters email and password
2. Backend validates credentials
3. Backend returns JWT token (no username stored in localStorage)
4. Frontend stores token in sessionStorage
5. Redirects to Dashboard

### Username Display Flow:
1. Navbar component detects token in sessionStorage
2. Makes API call to `/api/user/me`
3. Backend fetches user data from MongoDB
4. Returns username (or email prefix if empty)
5. Navbar displays "Welcome, [username]"

### Session Expiration Flow:
1. User closes browser tab/window
2. sessionStorage automatically clears
3. Token is lost
4. Next visit requires login again

### API Request Flow:
1. Frontend makes API request (e.g., to `/api/user/stats`)
2. Axios interceptor automatically adds token from sessionStorage
3. Backend validates token via authMiddleware
4. Request processed if token valid

---

## Benefits of These Changes

### 1. Security Improvements
✅ **Automatic Session Expiration**: Users logged out when browser closes
✅ **Token Validation**: Invalid tokens automatically detected and cleared
✅ **Reduced Data Storage**: No sensitive data stored in localStorage

### 2. Data Accuracy
✅ **Real-Time Username**: Always fetches from database, not stale cached data
✅ **Database Source of Truth**: Username comes from User model, not login response
✅ **Fallback Handling**: Shows email prefix if username field empty

### 3. Better User Experience
✅ **Fresh Data**: Username always up-to-date from database
✅ **Clear Sessions**: No confusion about login state after browser restart
✅ **Consistent Behavior**: Same session management for users and facilities

---

## Migration Notes

### For Existing Users:
- Old localStorage tokens will remain but won't be used
- Users need to login again once after this update
- Previous sessions won't automatically carry over

### For Developers:
- All `localStorage` references for auth tokens changed to `sessionStorage`
- New `/api/user/me` endpoint available for fetching current user data
- Username now dynamically fetched, not stored on login

---

## API Endpoints Summary

### New Endpoints:
```
GET /api/user/me
  - Protected route (requires JWT)
  - Returns current user data
  - Response: { id, username, email, phone, points, pendingPoints, level, joinedAt }
```

### Modified Endpoints:
```
POST /login
  - Before: Returns { token, email, username }
  - After: Returns { token, email, username }
  - Note: Frontend no longer stores username, fetches from /api/user/me instead
```

---

## Troubleshooting

### Issue: Username still shows "undefined"
**Solution**:
1. Check user has `username` field in MongoDB
2. If empty, update user document: `db.users.update({_id: ...}, {$set: {username: "YourName"}})`
3. Logout and login again
4. Check browser console for API errors

### Issue: Immediately logged out after login
**Solution**:
1. Check backend server is running
2. Verify `/api/user/me` endpoint works (check Network tab)
3. Check JWT token is valid (not expired)
4. Verify MongoDB connection

### Issue: Session persists after browser close (old behavior)
**Solution**:
1. Clear browser cache and localStorage manually
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify using sessionStorage in DevTools

---

## Files Modified Summary

**Backend (1 file)**:
1. `backend/server.js` - Added `/api/user/me` endpoint

**Frontend (7 files)**:
1. `frontend/src/api/http.js` - Changed to sessionStorage
2. `frontend/src/pages/Login.jsx` - Simplified login storage
3. `frontend/src/components/Navbar.jsx` - Fetch user data from API
4. `frontend/src/components/ProtectedRoute.jsx` - Use sessionStorage
5. `frontend/src/pages/RecyclePage.jsx` - Use sessionStorage
6. `frontend/src/pages/FacilityLogin.jsx` - Use sessionStorage
7. `frontend/src/pages/FacilityConfirm.jsx` - Use sessionStorage

---

**Last Updated**: November 28, 2025
**Status**: ✅ Completed and Tested
**Backend Server**: Running on port 5000
**MongoDB**: Connected
