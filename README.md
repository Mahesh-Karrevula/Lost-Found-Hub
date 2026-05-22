# Lost & Found Hub 🔍

Lost & Found Hub is a modern MERN stack (MongoDB, Express, React, Node.js) web application designed to help community members list lost or found items, coordinates of discovery, upload pictures, and chat privately to coordinate item returns.

The application features a premium dark-themed glassmorphism interface with neon highlights, smooth transitions, and responsive styling.

---

## 🚀 Key Features

- **Double-Toggle Listings**: List lost or found belongings with tag attributes, descriptions, and address locations.
- **Local Photo Uploads**: Select files directly from local storage, drop files with drag-and-drop support, perform file validation, or paste web picture links.
- **GPS Coordinates Retrieval**: Locate item loss/discovery using browser Geolocation API coordinates populators.
- **Real-Time Chatting**: Direct messaging thread inbox between community members to negotiate returning items.
- **Unread Notifications**: Live notification logs keeping you updated on message receipts and listings activity.
- **Moderator Spam Dashboard**: Actionable dashboard for admins to examine spam reports, look at listing details, and dismiss or resolve issues.

---

## 🛠️ Tech Stack

### Frontend
- **React SPA** (Single Page Application)
- **React Router DOM** (Client Routing)
- **Lucide React** (Vector Icon System)
- **Vanilla CSS** (Custom glassmorphism tokens, gradients, and micro-animations)

### Backend
- **Node.js** & **Express**
- **Mongoose** (Object Modeling for MongoDB Atlas)
- **JWT** (JSON Web Tokens authentication session handler)
- **Bcryptjs** (Secure credential hashing)

---

## 📁 Repository Structure

```
Lost-Found-Hub/
├── backend/                  # Express REST API Server
│   ├── config/               # DB Connection setup
│   ├── controllers/          # Request handler middleware logic
│   ├── middleware/           # JWT authentication route guards
│   ├── models/               # Mongoose database models (with auto-increment hooks)
│   ├── routes/               # API Router mappings
│   ├── index.js              # Server entry point
│   └── package.json
│
└── frontend/                 # React Single Page App Client
    ├── public/
    └── src/
        ├── components/       # Custom React Navbar and indicators
        ├── context/          # Auth context provider with global state
        ├── pages/            # View pages (Login, Dashboard, Create, Chat, Profile, Admin)
        ├── App.js            # Frontend Router configuration
        ├── index.css         # Neon Glassmorphism design system styles
        └── index.js          # App entry point
```

---

## ⚙️ Installation and Setup

### Prerequisites
- **Node.js** installed on your system.
- **MongoDB Atlas** database cluster.

### 1. Backend Setup
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://karravulamahesh_db_user:5Joj30i5GqbBVUaR@cluster0.hj6zish.mongodb.net/
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

### 2. Frontend Setup
1. Navigate into the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React client:
   ```bash
   npm start
   ```
   *The development client runs on `http://localhost:3000`.*

---

## 🔒 Authentication Flow
- All user requests use a JSON Web Token (JWT) sent via the `Authorization: Bearer <token>` header.
- Token generation lasts 30 days and is secured on the frontend using `localStorage`.

## 📦 Database Schemas & Auto-Increment
- To maintain compatibility with older databases, integer `id` parameters are automatically tracked and incremented via a custom `counters` schema pre-save hook on all new document entries.
