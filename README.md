# 🏥 MediConnect — MERN Telemedicine Platform

A full-stack, production-ready telemedicine app built with the MERN stack (MongoDB, Express, React, Node.js).

---

## ✨ Features

| Feature | Details |
|---|---|
| **Authentication** | JWT + bcrypt, role-based (Patient / Doctor / Admin) |
| **Doctor Profiles** | Specialization, qualifications, fees, availability, ratings |
| **Appointment Booking** | Real-time slot checking, video/in-person types |
| **Video Consultation** | WebRTC P2P with Socket.io signaling + in-call chat |
| **Prescriptions** | Full Rx with medicines, lab tests, follow-up dates |
| **Medical Records** | Upload, categorize, and manage health documents |
| **Notifications** | Real-time Socket.io push + persistent DB notifications |
| **Dashboards** | Dedicated views for Patient, Doctor, and Admin |
| **Admin Panel** | Doctor approval, user management, platform stats |
| **Search & Filter** | Find doctors by specialization, rating, availability |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone & Install

```bash
# Backend
cd mediconnect/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mediconnect
JWT_SECRET=your_super_secret_key_min_32_chars_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:3000
```

---

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates demo accounts:

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Admin   | admin@mediconnect.com        | Admin@123    |
| Patient | arjun@example.com            | Patient@123  |
| Doctor  | dr.priya@mediconnect.com     | Doctor@123   |

---

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev   # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm start     # runs on http://localhost:3000
```

---

## 📁 Project Structure

```
mediconnect/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── doctorController.js    # Doctor CRUD + search
│   │   ├── appointmentController.js
│   │   ├── prescriptionController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── User.js                # Patient / Doctor / Admin
│   │   ├── Doctor.js              # Doctor profile schema
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   ├── MedicalRecord.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── recordRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── seeder.js              # Sample data seeder
│   ├── server.js                  # Express + Socket.io entry
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   └── common/
        │       └── DashboardLayout.js   # Sidebar + topbar
        ├── context/
        │   ├── AuthContext.js           # JWT auth state
        │   └── SocketContext.js         # Socket.io + WebRTC
        ├── hooks/
        │   └── useVideoCall.js          # WebRTC hook
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.js
        │   │   └── RegisterPage.js
        │   ├── patient/
        │   │   ├── Dashboard.js
        │   │   ├── FindDoctors.js
        │   │   ├── Appointments.js
        │   │   ├── MedicalRecords.js
        │   │   ├── Prescriptions.js
        │   │   └── VideoConsult.js
        │   ├── doctor/
        │   │   ├── Dashboard.js
        │   │   ├── Appointments.js
        │   │   ├── Patients.js
        │   │   ├── Profile.js
        │   │   └── WritePrescription.js
        │   ├── admin/
        │   │   ├── Dashboard.js
        │   │   ├── ManageDoctors.js
        │   │   └── ManageUsers.js
        │   └── NotificationsPage.js
        ├── utils/
        │   └── api.js                   # Axios API layer
        ├── App.js                       # Routes
        └── index.css                    # Design tokens + globals
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET  | `/api/auth/me` | ✅ | Get current user |
| PUT  | `/api/auth/updateprofile` | ✅ | Update profile |
| PUT  | `/api/auth/updatepassword` | ✅ | Change password |
| POST | `/api/auth/logout` | ✅ | Logout |

### Doctors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/doctors` | ❌ | List doctors (filterable) |
| GET  | `/api/doctors/:id` | ❌ | Get doctor |
| GET  | `/api/doctors/specializations` | ❌ | Get specialization list |
| GET  | `/api/doctors/:id/availability` | ❌ | Get slots |
| POST | `/api/doctors/profile` | Doctor | Create profile |
| PUT  | `/api/doctors/profile` | Doctor | Update profile |
| GET  | `/api/doctors/stats` | Doctor | Dashboard stats |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/appointments` | Patient | Book appointment |
| GET  | `/api/appointments` | ✅ | Get own appointments |
| GET  | `/api/appointments/:id` | ✅ | Get single |
| PUT  | `/api/appointments/:id/status` | Doctor/Admin | Update status |
| POST | `/api/appointments/:id/review` | Patient | Add review |

### Prescriptions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/prescriptions` | Doctor | Create Rx |
| GET  | `/api/prescriptions` | ✅ | Get own Rx list |
| GET  | `/api/prescriptions/:id` | ✅ | Get single Rx |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/toggle` | Admin | Activate/suspend |
| PUT | `/api/admin/doctors/:id/approve` | Admin | Approve doctor |
| PUT | `/api/admin/doctors/:id/reject` | Admin | Reject doctor |

---

## 🛡️ Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiry
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers
- CORS restricted to frontend URL
- Role-based access control on all routes
- Input validation via express-validator

---

## 🎥 Video Calls (WebRTC)

Video consultations use browser-native WebRTC with Socket.io for signaling:

1. Patient and doctor both navigate to the appointment's room URL
2. Socket.io room is created with the appointment's `roomId`
3. WebRTC offer/answer/ICE candidate exchange happens via Socket.io
4. P2P video and audio stream is established directly between browsers
5. In-call chat also runs through Socket.io

For production, add a TURN server to `ICE_SERVERS` in `useVideoCall.js`.

---

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | `5000` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | — |
| `JWT_EXPIRE` | Token expiry | `30d` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

---

## 📦 Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io, JWT, bcryptjs  
**Frontend:** React 18, React Router v6, Axios, Socket.io-client, date-fns, react-hot-toast  
**Real-time:** Socket.io (notifications, video signaling, chat)  
**Video:** WebRTC (native browser API)  
**Styling:** CSS custom properties (no framework dependency)
