♻️ TrashToTech - E-Waste Recycling and Management Platform
======================================================

A comprehensive full-stack web application designed to streamline electronic waste recycling. It connects users with authorized e-waste facilities, gamifies the recycling process with a tiered points system, and enables users to redeem earned points for real-world rewards.

* * * * *

🚀 Features
----------------------------

### 👤 User Features

-   **Smart Recycling Engine**: Dynamic points calculation based on **Material Value** (Gold, Lithium, Copper content) rather than just weight.

-   **Rewards Marketplace**: A fully functional store to redeem points for Gift Cards (Amazon, Zomato, etc.) and Charity Badges.

-   **Gamified Dashboard**: Real-time progress tracking with **Level Badges** (Eco-Novice → Platinum Guardian).

-   **Interactive Map**: Locate nearby verified e-waste facilities using geospatial queries.

-   **QR Code Scheduling**: Generate unique QR codes for drop-off verification.

### 🏢 Facility / Admin Features

-   **Facility Dashboard**: dedicated interface for facility managers to manage incoming visits.

-   **Visit Confirmation**: Verify user drop-offs by entering Reference Numbers.

-   **Smart Validation**: System automatically awards the remaining **70% of points** upon successful confirmation (rejecting revokes pending points).

### ⚙️ Technical Highlights

-   **Dual-Layer Validation**: Points calculation logic exists on both Frontend (UX) and Backend (Security) to prevent tampering.

-   **ACID Transactions**: MongoDB Transactions ensure points are only deducted if the voucher is successfully generated.

-   **Tailwind CSS**: Modern, responsive, and glassmorphism UI design.

* * * * *

🛠️ Tech Stack
--------------

### Frontend

-   **React.js** (v18.3.1)

-   **Tailwind CSS** (Styling)

-   **Axios** (API Communication)

-   **React Leaflet** (Maps)

-   **Chart.js** (Data Visualization)

### Backend

-   **Node.js & Express**

-   **MongoDB & Mongoose** (Geospatial Indexing)

-   **JWT** (Secure Authentication)

-   **Crypto** (Voucher & Reference Generation)

* * * * *

📂 Project Structure
--------------------

Plaintext

```
TrashToTech/
├── backend/
│   ├── middleware/
│   │   └── 🟨 auth.js                  # JWT Authentication
│   ├── models/
│   │   ├── 🟨 Facility.js              # GeoJSON Facility Schema
│   │   ├── 🟨 ScheduledVisit.js        # Visit & Transaction Schema
│   │   └── 🟨 User.js                  # User Profile & Points
│   ├── routes/
│   │   ├── 🟨 facilities.js            # Locator Logic
│   │   ├── 🟨 rewards.js               # Redemption Logic
│   │   ├── 🟨 users.js                 # Profile & Stats
│   │   └── 🟨 visit.js                 # Scheduling & Confirmation
│   ├── scripts/
│   │   ├── 🟨 reset_map.js
│   │   └── 🟨 seed_facilities_centroid.js
│   ├── utils/
│   │   ├── 🟨 levelLogic.js            # Badge/Level Calculations
│   │   └── 🟨 pointsCalculation.js     # MATERIAL VALUE ALGORITHM (Backend)
│   ├── 🟨 seedFacilities.js            # Database Seeder
│   ├── 🟨 server.js                    # Entry Point
│   ├── 🗂️ package.json
│   └── 🗂️ package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── 📄 index.html
│   │   └── 🖼️ logo.png
│   ├── src/
│   │   ├── api/
│   │   │   └── 🟨 http.js              # Axios Instance
│   │   ├── components/
│   │   │   ├── 🟦 FacilityMap.jsx
│   │   │   ├── 🟦 Footer.jsx
│   │   │   ├── 🟦 Navbar.jsx
│   │   │   └── 🟦 ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── 🟦 Dashboard.jsx        # User Stats & Levels
│   │   │   ├── 🟦 FacilityDashboard.jsx# Admin Visit Management
│   │   │   ├── 🟦 FacilityLocator.jsx
│   │   │   ├── 🟦 FacilityLogin.jsx
│   │   │   ├── 🟦 FacilityRegister.jsx
│   │   │   ├── 🟦 RecyclePage.jsx      # Scheduling Form
│   │   │   ├── 🟦 Rewards.jsx          # Redemption Store
│   │   │   ├── 🟦 Home.jsx
│   │   │   ├── 🟦 Login.jsx
│   │   │   ├── 🟦 SignUp.jsx
│   │   │   ├── 🟦 About.jsx
│   │   │   └── 🟦 Contact.jsx
│   │   ├── utils/
│   │   │   ├── 🟨 levelLogic.js        # Badge/Level Calculations
│   │   │   └── 🟨 pointsCalculation.js # MATERIAL VALUE ALGORITHM (Frontend)
│   │   ├── 🟨 App.js
│   │   ├── 🟨 index.js
│   │   └── 🎨 index.css                # Tailwind Imports
│   ├── 🟨 tailwind.config.js
│   ├── 🗂️ package.json
│   └── 🗂️ package-lock.json
│
└── 📜 README.md

```

* * * * *

💎 Points & Economy Logic
-------------------------

We use a **Material Value Algorithm** to calculate points. Items are categorized based on their recovery value (Gold, Lithium, Silicon).

### 1\. Calculation Formula

JavaScript

```
Points = Base_Value(Item_Tier) × Condition_Multiplier × Quantity

```

### 2\. Item Tiers

| **Tier** | **Description** | **Examples** | **Points (Avg)** |
| --- | --- | --- | --- |
| **Tier 1** | **Gold/Lithium Rich** | Laptops, Smartphones, Drones | **250 - 600 pts** |
| **Tier 2** | **Copper/Aluminum** | Desktops, Consoles, Monitors | **200 - 500 pts** |
| **Tier 3** | **Heavy Appliances** | Fridges, AC Units, Washing Machines | **600 - 900 pts** |
| **Tier 4** | **Accessories** | Chargers, Cables, Mice | **10 - 40 pts** |

### 3\. Distribution Rule (Anti-Fraud)

-   **30% Upfront:** Credited immediately as "Pending Points" when a user schedules a visit.

-   **70% Completion:** Credited only when the Facility Admin confirms the visit.

* * * * *

🚀 Setup Instructions
---------------------

### Backend Setup

1.  Navigate to the backend: `cd backend`

2.  Install packages: `npm install`

3.  Create `.env` file:

    Code snippet

    ```
    MONGO_URI=mongodb://localhost:27017/trash_to_tech
    JWT_SECRET=your_super_secret_key
    PORT=5000

    ```

4.  Seed Facilities (Optional): `node seedFacilities.js`

5.  Start Server: `node server.js`

### Frontend Setup

1.  Navigate to frontend: `cd frontend`

2.  Install packages: `npm install`

3.  Start React: `npm start`

* * * * *

🎮 Usage Flow
-------------

### User Journey

1.  **Schedule:** User selects items (e.g., "Smartphone"). App estimates **250 pts**.

2.  **Pending:** User gets **75 pts (30%)** immediately as "Pending".

3.  **Visit:** User shows QR Code at the facility.

4.  **Confirm:** Facility Admin accepts the visit.

5.  **Reward:** User receives the remaining **175 pts (70%)**. Total = 250.

6.  **Redeem:** User goes to **Rewards Page** and buys an Amazon Gift Card for 500 pts.

* * * * *

🔮 Future Enhancements
----------------------

-   [ ] **AI Image Recognition:** Upload photo of waste to auto-detect category.

-   [ ] **Corporate Portal:** Bulk scheduling for offices.

-   [ ] **Leaderboard:** City-wise ranking of top recyclers.

* * * * *

**Made with 💚 for a cleaner planet.**