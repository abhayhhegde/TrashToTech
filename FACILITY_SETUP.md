# Facility Setup Guide - Trash to Tech

This guide explains the new facility authentication system and how to set up facilities to confirm recycling visits.

## What's New

### Facility Authentication
Facilities now have their own login system separate from users. This allows facilities to:
- Securely confirm recycling visits
- Scan QR codes from users
- Award or reject points based on actual items received
- Access a dedicated confirmation interface

### Features Added
1. **Facility Login/Register** - Separate authentication for facilities
2. **QR Code Scanner** - Scan user QR codes to auto-load visit details
3. **Auto-load Visit Details** - Entering reference number fetches all visit information
4. **Enhanced Dashboard** - User dashboard shows facility name and address in history

## Setup Instructions

### Step 1: Update Existing Facilities with Passwords

Run this script to add passwords to all existing facilities in your database:

```bash
cd backend
node updateFacilityPasswords.js
```

This will:
- Add email addresses to all facilities (based on facility name)
- Set password to `admin123` for all existing facilities
- Display the generated emails for each facility

Example output:
```
✓ Updated: E-Parisaraa Pvt Ltd - Email: eparisaraapvtltd@facility.trastotech.com
✓ Updated: Saahas Zero Waste - Email: saahaszerowaste@facility.trastotech.com
...

Default password for all facilities: admin123

Facility emails:
  - E-Parisaraa Pvt Ltd: eparisaraapvtltd@facility.trastotech.com
  - Saahas Zero Waste: saahaszerowaste@facility.trastotech.com
  ...
```

### Step 2: Install Frontend Dependencies

The new QR scanner feature requires an additional package:

```bash
cd frontend
npm install
```

This will install `html5-qrcode@^2.3.8` which is already added to package.json.

### Step 3: Restart Both Servers

**Backend:**
```bash
cd backend
node server.js
```

**Frontend:**
```bash
cd frontend
npm start
```

## Facility Usage Guide

### For Existing Facilities

1. **Navigate to Facility Login**
   - Go to `http://localhost:3000/facility/login`
   - Or click "Facility Login" link from user login page

2. **Login with Default Credentials**
   - Email: Use the email from updateFacilityPasswords.js output
   - Password: `admin123`
   - Example: `eparisaraapvtltd@facility.trastotech.com` / `admin123`

3. **Change Password** (Recommended)
   - After first login, contact system admin to change password
   - Or register a new facility with your own credentials

### For New Facilities

1. **Navigate to Facility Register**
   - Go to `http://localhost:3000/facility/register`

2. **Fill in Registration Form**
   ```
   Required fields:
   - Facility Name
   - Email (unique)
   - Password
   - Confirm Password

   Optional fields:
   - Address
   - Contact Info
   - Operating Hours
   - Accepted Items (comma-separated)
   - Latitude/Longitude coordinates
   ```

3. **Submit Registration**
   - Upon success, you'll be redirected to login
   - Login with your new credentials

## Confirming Recycling Visits

### Option 1: Scan QR Code

1. **Login to Facility Account**
   - Navigate to `/facility/confirm` (auto-redirected after login)

2. **Click "Start QR Scanner"**
   - Allow camera permissions when prompted
   - Position user's QR code in the scanner frame
   - Visit details will auto-load once scanned

3. **Review Visit Details**
   - Check scheduled items
   - Verify user information
   - Review estimated points

4. **Modify Actual Items (if needed)**
   - The "Actual Items" field is pre-filled with scheduled items
   - Edit JSON if actual items differ from scheduled
   - Format:
     ```json
     [
       {
         "itemName": "Laptop",
         "category": "laptop",
         "condition": "good",
         "weight": 2.5,
         "quantity": 1
       }
     ]
     ```

5. **Choose Action**
   - **Accept**: Awards remaining 70% points to user
   - **Reject**: Removes the 30% pending points

6. **Submit Confirmation**
   - Click "Confirm & Submit"
   - User will receive points (if accepted)
   - Visit status updates to "completed" or "cancelled"

### Option 2: Manual Reference Entry

1. **Ask User for Reference Number**
   - Format: `TT-XXXXXXXX` (e.g., `TT-A1B2C3D4`)

2. **Enter Reference in Input Field**
   - Visit details auto-load when valid reference detected

3. **Follow steps 3-6 from Option 1**

## User Experience

### For Users Recycling Items

1. **Schedule Visit** (as before)
   - User fills item details on RecyclePage
   - Selects facility from map
   - Clicks "Schedule & Get Points"

2. **Receive QR Code & Reference**
   - User sees QR code on screen
   - Reference number displayed (e.g., `TT-A1B2C3D4`)
   - 30% points credited as "pending"

3. **Visit Facility**
   - Bring items + show QR code OR tell reference number
   - Facility scans QR or enters reference

4. **Confirmation**
   - Facility reviews and confirms items
   - User receives remaining 70% points
   - Level updates if threshold reached

5. **Check Dashboard**
   - View updated points total
   - See completed visit in history
   - **NEW**: History shows facility name and address

## API Endpoints

### Facility Authentication

```
POST /facility/register
Body: {
  name, email, password, address, contactInfo,
  operatingHours, acceptedItems[], coordinates[lng, lat]
}
Response: { message, facilityId }

POST /facility/login
Body: { email, password }
Response: { token, email, name, facilityId }
```

### Visit Management

```
GET /api/visit/details/:referenceNumber
Response: Full visit object with items, status, user info

POST /api/visit/confirm
Body: { referenceNumber, action: 'accept'|'reject', actualItems[] }
Response: { message, visit, userPoints, userLevel }
```

## Database Schema Updates

### Facility Model (Updated)
```javascript
{
  name: String (required),
  email: String (unique, for login),
  passwordHash: String (hashed password),
  address: String,
  capacity: Number,
  acceptedItems: [String],
  operatingHours: String,
  contactInfo: String,
  certifications: [String],
  rating: Number,
  status: 'active' | 'inactive',
  location: {
    type: 'Point',
    coordinates: [lng, lat]
  },
  createdAt: Date
}
```

### JWT Token Payload (Facility)
```javascript
{
  facilityId: ObjectId,
  email: String,
  name: String,
  type: 'facility',  // Distinguishes from user tokens
  iat: Number,
  exp: Number
}
```

## Security Notes

1. **Default Password**
   - All seeded facilities have password `admin123`
   - **IMPORTANT**: Change this in production!
   - Recommend facilities change password after first login

2. **Token Storage**
   - Facility tokens stored in localStorage as `facilityToken`
   - Separate from user tokens (`authToken`)
   - Facilities cannot access user-only routes

3. **Route Protection**
   - `/facility/confirm` checks for valid facility token
   - Redirects to `/facility/login` if not authenticated

## Troubleshooting

### "Facility not set up for login"
- Run `updateFacilityPasswords.js` to add passwords
- Or register facility through `/facility/register`

### "Visit not found"
- Verify reference number format (TT-XXXXXXXX)
- Check if visit exists in database
- Ensure MongoDB is running

### QR Scanner not working
- Check browser camera permissions
- Use HTTPS in production (camera requires secure context)
- Verify `html5-qrcode` package is installed

### "Success: Visit confirmed but no user found"
- User was not logged in when scheduling visit
- Visit created with email fallback instead of userId
- Points cannot be awarded without user account
- **Solution**: User should create account and login before scheduling

## Next Steps

After setup:

1. **Test the Full Flow**
   - Register as user → Schedule visit → Get QR code
   - Login as facility → Scan QR → Confirm visit
   - Check user dashboard for updated points

2. **Customize Facility Passwords**
   - Change default passwords for security
   - Or create facility management interface

3. **Train Facility Staff**
   - Show them how to login
   - Demonstrate QR scanning
   - Explain accept/reject logic

4. **Monitor Confirmations**
   - Check visit statuses in database
   - Verify points are being awarded correctly
   - Review facility activity

## Support

For issues or questions:
- Check console logs for errors
- Verify all services are running
- Ensure MongoDB has facility documents with email and passwordHash fields

---

**Security Reminder**: In production, use strong passwords and enable HTTPS for the facility confirmation interface!
