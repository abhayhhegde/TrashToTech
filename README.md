# TrashToTech - E-Waste Monitoring Platform

A comprehensive web application for managing electronic waste recycling, connecting users with authorized e-waste facilities, and tracking environmental impact.

## Features

### User Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Interactive Dashboard**: View recycling statistics, points earned, and carbon footprint reduction
- **Facility Locator**: Find nearby e-waste recycling facilities using interactive maps
- **Visit Scheduling**: Schedule e-waste drop-offs with QR code generation
- **Points System**: Earn points based on items recycled (30% upfront, 70% on confirmation)
- **Level System**: Progress through Bronze, Silver, Gold, and Platinum levels
- **Recycling History**: Track all past and scheduled visits

### Admin Features
- **Visit Confirmation**: Scan QR codes to confirm recycling visits
- **Points Management**: Award or reject points based on actual items received

### Technical Features
- Real-time geospatial queries for facility search
- Dynamic points calculation based on item weight and condition
- Comprehensive dashboard with charts and statistics
- Mobile-responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18.3.1
- React Router DOM 6.26.2
- Axios for API calls
- Leaflet & React-Leaflet for maps
- Chart.js & React-Chartjs-2 for data visualization
- Tailwind CSS for styling

### Backend
- Node.js with Express 5.1.0
- MongoDB with Mongoose 8.20.0
- JWT for authentication
- bcryptjs for password hashing
- QRCode generation for visits
- Geospatial queries with MongoDB 2dsphere indexes

## Project Structure

```
TrashToTech/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with points, level, history
│   │   ├── Facility.js       # Facility schema with geospatial index
│   │   └── ScheduledVisit.js # Visit tracking schema
│   ├── routes/
│   │   ├── visit.js          # Visit scheduling and confirmation
│   │   └── facilities.js     # Facility management and search
│   ├── server.js             # Main server file
│   ├── seedFacilities.js     # Database seeding script
│   ├── .env.example          # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── FacilityMap.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Dashboard.jsx       # Real-time user stats
│   │   │   ├── RecyclePage.jsx     # Map-based scheduling
│   │   │   ├── AdminConfirm.jsx    # Admin confirmation
│   │   │   ├── FacilityLocator.jsx
│   │   │   ├── Rewards.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   ├── api/
│   │   │   └── http.js             # Axios configuration
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - local or Atlas
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   MONGO_URI=mongodb://localhost:27017/trash_to_tech
   JWT_SECRET=your_secure_random_secret_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Seed the database with facilities**
   ```bash
   node seedFacilities.js
   ```
   This will add 13 sample e-waste facilities across major Indian cities.

5. **Start the backend server**
   ```bash
   node server.js
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the React development server**
   ```bash
   npm start
   ```
   Application will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token

### User
- `GET /api/user/profile` - Get user profile (protected)
- `GET /api/user/stats` - Get dashboard statistics (protected)
- `GET /api/user/history` - Get recycling history (protected)

### Facilities
- `GET /api/facilities` - Get all active facilities
- `GET /api/facilities/nearby?lat=...&lng=...&radius=...` - Get nearby facilities
- `GET /api/facilities/:id` - Get facility by ID
- `POST /api/facilities/add` - Add new facility (admin)

### Visits
- `POST /api/visit/schedule` - Schedule a visit (generates QR code)
- `POST /api/visit/confirm` - Confirm visit and award points (admin)
- `GET /api/visit/history?email=...` - Get visit history

## Usage Flow

### User Journey

1. **Register/Login**
   - Create account or login to existing account
   - JWT token stored in localStorage

2. **Schedule Recycling Visit**
   - Navigate to "Recycle Page"
   - Enter item details (name, category, weight, condition)
   - Click on map or use device location to set pickup location
   - Find nearby facilities (within 15km radius)
   - Select a facility from the list
   - Click "Schedule & Get Points"
   - Receive QR code and reference number
   - Get 30% points credited immediately as "pending points"

3. **Visit Facility**
   - Bring items and QR code/reference number to the facility
   - Facility admin scans QR or enters reference number

4. **Admin Confirmation**
   - Admin reviews actual items received
   - Accepts or rejects the visit
   - If accepted: Remaining 70% points awarded, visit marked as "completed"
   - If rejected: Pending points removed, visit marked as "cancelled"

5. **Track Progress**
   - View dashboard with real-time statistics
   - See total items recycled, points earned, CO₂ reduction
   - Track level progression (Bronze → Silver → Gold → Platinum)
   - View recycling history with visit statuses

### Admin Journey

1. **Login with Admin Credentials**
   - Navigate to `/admin/confirm`

2. **Confirm Visits**
   - Enter reference number from user's QR code
   - Review scheduled items
   - Choose action (Accept/Reject)
   - Optionally adjust actual items received
   - Submit confirmation

3. **Points Awarded**
   - User receives remaining points
   - User level updated if thresholds reached
   - Visit marked as completed in history

## Points Calculation

Points are calculated based on:
- **Base Points**: Weight (kg) × 10
- **Condition Multiplier**:
  - Good: 1.5x
  - Moderate: 1.2x
  - Poor: 1.0x
- **Distribution**:
  - 30% credited immediately when scheduled
  - 70% credited upon admin confirmation

### Level Thresholds
- **Bronze**: 0 - 499 points
- **Silver**: 500 - 1,999 points
- **Gold**: 2,000 - 4,999 points
- **Platinum**: 5,000+ points

## Environment Impact

CO₂ reduction is estimated at **10 kg CO₂ per kg of e-waste** recycled.

## Development

### Running in Development

**Backend:**
```bash
cd backend
npm install
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```
Creates optimized production build in `frontend/build/`

## Database Schema

### User
```javascript
{
  username: String,
  email: String (unique, indexed),
  passwordHash: String,
  phone: String,
  points: Number (default: 0),
  pendingPoints: Number (default: 0),
  level: String (default: 'Bronze'),
  recyclingHistory: [ObjectId] (ref: ScheduledVisit),
  joinedAt: Date
}
```

### Facility
```javascript
{
  name: String,
  address: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // GeoJSON
  },
  capacity: Number,
  acceptedItems: [String],
  operatingHours: String,
  contactInfo: String,
  certifications: [String],
  rating: Number,
  status: 'active' | 'inactive',
  source: String
}
// Index: 2dsphere on location
```

### ScheduledVisit
```javascript
{
  userId: ObjectId (ref: User),
  email: String,
  facilityId: ObjectId (ref: Facility),
  referenceNumber: String (unique),
  items: [{
    itemName: String,
    category: String,
    condition: String,
    weight: Number,
    quantity: Number,
    estimatedPoints: Number
  }],
  estimatedPoints: Number,
  pendingPoints: Number (30%),
  actualPoints: Number,
  status: 'scheduled' | 'completed' | 'cancelled',
  qrCodeDataUrl: String,
  scheduledAt: Date,
  completedAt: Date
}
```

## Future Enhancements

- [ ] Rewards redemption catalog
- [ ] Email/SMS notifications for visit confirmations
- [ ] Mobile app with QR scanner
- [ ] Admin dashboard for analytics
- [ ] Bulk scheduling for organizations
- [ ] Integration with CPCB API for real-time facility data
- [ ] Community leaderboards
- [ ] Educational content about e-waste
- [ ] Pickup scheduling from user location

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with care for a cleaner environment**
