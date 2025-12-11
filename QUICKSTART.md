# Quick Start Guide - Trash to Tech

Get your Trash to Tech application running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js installed (v14+): `node --version`
- [ ] MongoDB running locally OR MongoDB Atlas account
- [ ] Git (optional, for cloning)

## Step 1: Setup Backend (2 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies (this may take 1-2 minutes)
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your MongoDB connection
# For local MongoDB: MONGO_URI=mongodb://localhost:27017/trash_to_tech
# For Atlas: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trash_to_tech

# Seed database with sample facilities
node seedFacilities.js

# Start backend server
node server.js
```

You should see:
```
MongoDB connected
Server listening 5000
```

## Step 2: Setup Frontend (2 minutes)

Open a NEW terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (this may take 1-2 minutes)
npm install

# Create environment file
cp .env.example .env

# Start React development server
npm start
```

Browser will automatically open to `http://localhost:3000`

## Step 3: Test the Application (1 minute)

### Create an Account
1. Click "Sign Up" button
2. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Phone: 1234567890
   - Password: password123
3. Click "Sign Up"

### Schedule Your First Recycling Visit
1. After signup, login with your credentials
2. Click "Recycle New Item" on dashboard
3. Fill in item details:
   - Item Name: Old Laptop
   - Category: Laptop
   - Weight: 2 (kg)
   - Age: 5 (years)
   - Condition: Good
4. Click "Use my location" OR click on the map
5. Click "Find Nearby" to see facilities
6. Select a facility from the list
7. Click "Schedule & Get Points"
8. You'll see a QR code and receive pending points!

### View Your Dashboard
1. Navigate to Dashboard
2. See your points, recycled items, and CO₂ reduction
3. View your recycling history

### Test Admin Confirmation (Optional)
1. Navigate to `/admin/confirm`
2. Enter the reference number from your QR code (e.g., TT-A1B2C3D4)
3. Select "Accept"
4. Click "Submit"
5. Go back to Dashboard to see your points updated!

## Troubleshooting

### Backend won't start?
- **MongoDB connection error**: Make sure MongoDB is running locally (`mongod`) or check your Atlas connection string
- **Port 5000 already in use**: Change `PORT=5001` in backend/.env

### Frontend won't start?
- **Port 3000 already in use**: The CLI will ask if you want to use a different port (say yes)
- **Module not found errors**: Delete `node_modules` folder and run `npm install` again

### No facilities showing on map?
- Make sure you ran `node seedFacilities.js` in the backend folder
- Check MongoDB connection and verify facilities were added:
  ```bash
  # In MongoDB shell or Compass
  use trash_to_tech
  db.facilities.count()
  # Should return 13
  ```

### Dashboard shows all zeros?
- This is normal for new accounts! Schedule and complete a visit to see data
- Admin must confirm your visit for points to be fully credited

## Common MongoDB Setup

### Option 1: Local MongoDB (Recommended for development)

**Windows:**
1. Download MongoDB Community Server from mongodb.com
2. Install and start MongoDB service
3. Use: `MONGO_URI=mongodb://localhost:27017/trash_to_tech`

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Option 2: MongoDB Atlas (Cloud - Free tier available)

1. Go to mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database user password
7. Use this as your `MONGO_URI`

## Next Steps

Now that your application is running:

1. **Explore Features:**
   - Try scheduling multiple items
   - Check different facilities on the map
   - Test the admin confirmation flow
   - Watch your level progress (Bronze → Silver → Gold → Platinum)

2. **Customize:**
   - Add more facilities via the seed script
   - Modify points calculation in `backend/routes/visit.js`
   - Customize UI styling in frontend components

3. **Development:**
   - Check [README.md](README.md) for full documentation
   - See API endpoints for integration
   - Explore database schemas

## Support

If you encounter issues:
1. Check the terminal for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running and accessible
4. Check that both backend (port 5000) and frontend (port 3000) are running

**Happy Recycling!** 🌱♻️
