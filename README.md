# FoodBridge (Anna Setu) — Surplus Food Redistribution & Waste Management System

**FoodBridge (Anna Setu)** is a full MERN stack food waste management platform connecting **Restaurants** with surplus food to **NGOs** and **Volunteers** to serve needy people with 100% accountability at every step.

---

## 🌟 Key Features

1. **4 Distinct User Roles & RBAC**:
   - **Admin**: Document verification review (FSSAI/NGO 80G/Darpan/Aadhaar), user suspensions, platform impact analytics (kg food saved, headcount fed), city heatmap visualizer, low-rating complaint audit.
   - **Restaurant Owner**: Post surplus food listings (type, quantity kg, prep time, expiry window hours, photos), accept/reject NGO claim requests, generate 4-digit pickup OTPs, view donor impact stats.
   - **NGO**: Browse & filter nearby food surplus (map + list views), claim food (direct pickup or volunteer request), verify pickup OTP, submit final distribution proof (photo + headcount + location).
   - **Volunteer/Delivery**: Browse open delivery tasks, accept task, verify pickup OTP at restaurant, broadcast live GPS location via Socket.io, submit delivery confirmation & headcount proof.

2. **Verification & Trust System**:
   - Document upload & manual Admin approval workflow (`isVerified` partner badge).
   - 4-Digit Pickup OTP Handoff Chain (Restaurant accepts claim -> system generates OTP -> pickup person verifies OTP).
   - Distribution Proof (Photo proof, headcount fed, geo-location) to close the donation audit loop.
   - Full Audit Trail per donation (`Listed` → `Claimed` → `Assigned` → `Picked Up` → `In Transit` → `Distributed` → `Closed`).

3. **Real-time Layer**:
   - Live Socket.io notifications (Listing posted, claim accepted, OTP verified, distribution completed).
   - Socket.io live GPS location broadcasting for volunteer delivery tracking.
   - Matched Restaurant ↔ NGO ↔ Volunteer coordination chat thread.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Redux Toolkit, React Router v7, Lucide React, Leaflet & React-Leaflet (Maps), Socket.io Client, Axios, Tailwind CSS.
- **Backend**: Node.js, Express.js (ES Modules), MongoDB + Mongoose, Socket.io, JWT Auth, Cloudinary (File uploads via Multer), Helmet, CORS.

---

## 📁 Modular Directory Structure (Designed for 4-Person Team)

```
FoodBridge/
├── backend/
│   ├── package.json
│   ├── server.js               # App entry & Socket.io server
│   ├── seed.js                 # Seed script with realistic demo data
│   ├── .env.example
│   └── src/
│       ├── config/             # db.js, cloudinary.js
│       ├── middleware/         # authMiddleware.js, errorMiddleware.js
│       ├── models/             # User, VerificationDocument, FoodListing, Donation, Rating, Notification, Message
│       ├── socket/             # socketHandler.js (GPS tracking & rooms)
│       └── modules/            # Role & feature modules
│           ├── admin/          # adminRoutes.js & adminController.js
│           ├── restaurant/     # restaurantRoutes.js & restaurantController.js
│           ├── ngo/            # ngoRoutes.js & ngoController.js
│           ├── volunteer/      # volunteerRoutes.js & volunteerController.js
│           ├── auth/           # authRoutes.js & authController.js
│           ├── verification/   # verificationRoutes.js & verificationController.js
│           └── chat/           # chatRoutes.js & chatController.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── components/         # Navbar, ProtectedRoute, AuditTrailModal, LiveTrackingMap, ChatModal
        ├── redux/              # store.js, authSlice.js
        ├── services/           # socket.js
        └── pages/
            ├── Home.jsx
            ├── auth/           # Login.jsx, Register.jsx, UploadVerificationDocs.jsx
            ├── admin/          # AdminDashboard.jsx
            ├── restaurant/     # RestaurantDashboard.jsx
            ├── ngo/            # NgoDashboard.jsx
            └── volunteer/      # VolunteerDashboard.jsx
```

---

## 👥 4-Member Team Module Split & Task Allocation

To prevent merge conflicts and allow parallel development across 4 team members:

| Team Member | Module Focus | Backend Responsibility | Frontend Responsibility |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Auth & Admin Governance** | `auth/`, `verification/`, `admin/` APIs, User & Verification Document Schemas, Admin Stats & Heatmap aggregation | Login, Register, Document Upload UI, Admin Dashboard, Verifications Queue, User Suspensions |
| **Member 2** | **Restaurant Module** | `restaurant/` APIs, `FoodListing` Schema, FSSAI Verification, Pickup OTP Generation | Restaurant Dashboard, Create Surplus Listing Modal, NGO Claim Requests & OTP Display |
| **Member 3** | **NGO Operations** | `ngo/` APIs, Claim logic, Direct Pickup OTP verification, Distribution Proof Submission & Headcount tracking | NGO Dashboard, Available Listings Map/Filter View, Claim Modal, Proof Submission Modal |
| **Member 4** | **Volunteer Delivery Engine** | `volunteer/` APIs, `Donation` Audit Trail Schema, Socket.io Real-Time GPS Tracking Handler (`socketHandler.js`) | Volunteer Dashboard, Available Tasks Board, Pickup OTP Verification Modal, Live Tracking Map, GPS Simulator |

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017/foodbridge` or a MongoDB Atlas URI

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start MongoDB and run seed script (Populates Admin, Restaurants, NGOs, Volunteers, Listings & Donations)
npm run seed

# Start Backend server in development mode
npm run dev
```

Server will start on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run frontend dev server
npm run dev
```

App will open on `http://localhost:5173`.

---

## 🔑 Demo Account Credentials (For Instant Testing)

All seed accounts use the password: `password123`

| Role | Email | Features to Test |
| :--- | :--- | :--- |
| **Super Admin** | `admin@foodbridge.org` | Review FSSAI/NGO docs, approve/reject partners, view total food saved kg, city heatmap & complaints |
| **Restaurant 1** | `spicegarden@restaurant.com` | Post surplus food, view NGO claim requests, accept claim & view generated 4-digit Pickup OTP |
| **Restaurant 2** | `tajbakery@restaurant.com` | View donor history & food donation impact stats |
| **NGO 1** | `contact@feedinghope.org` | Browse available food listings, claim food, request volunteer, enter OTP, submit headcount proof |
| **NGO 2** | `info@annamseva.org` | View claimed donations, submit distribution proof photos & headcount |
| **Volunteer 1** | `rahul.volunteer@gmail.com` | Accept delivery task, enter Pickup OTP at restaurant, run Live GPS Simulation, submit delivery proof |
| **Volunteer 2** | `priya.delivery@gmail.com` | View completed deliveries & volunteer impact stats |

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/foodbridge
JWT_SECRET=foodbridge_super_secret_jwt_key_2026_safe_token
FRONTEND_URL=http://localhost:5173

# Optional Cloudinary credentials for live file uploads (falls back to local public/uploads storage if omitted)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔒 Verification & OTP Handoff Workflow

1. **User Signup & Document Upload**:
   - Partner registers as Restaurant (FSSAI), NGO (Darpan/80G), or Volunteer (Aadhaar).
   - Document uploaded -> stored in `VerificationDocument`.
   - Admin reviews document -> approves account -> `isVerified` set to `true`.

2. **Listing & Claiming**:
   - Verified Restaurant posts surplus food -> Status `available`.
   - Verified NGO submits claim request (requests volunteer OR direct pickup).

3. **Pickup OTP Handshake**:
   - Restaurant accepts claim -> System generates 4-digit `pickupOtp`.
   - Pickup person (NGO rep or Volunteer) arrives at restaurant, inputs OTP.
   - On valid OTP -> Status advances to `picked_up` / `in_transit`.

4. **Live GPS Tracking**:
   - Volunteer emits `update_location` (`lat`, `lng`) via Socket.io.
   - Leaflet map updates in real-time for Restaurant & NGO.

5. **Distribution Proof & Closure**:
   - At distribution location, NGO/Volunteer submits photo proof, headcount (e.g. 50 people fed), and geo-location.
   - Status advances to `distributed` → `closed`. Impact stats updated across all accounts.
