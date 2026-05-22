# Lost & Found Hub 🔍

[![Live Site](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://lost-found-hub-mu.vercel.app)

Lost & Found Hub is a modern MERN stack (MongoDB, Express, React, Node.js) web application designed to help community members list lost or found items, coordinates of discovery, upload pictures, and chat privately to coordinate item returns.

**Live Application URL**: [lost-found-hub-mu.vercel.app](https://lost-found-hub-mu.vercel.app)

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

## ⚙️ How to Use & Local Setup

### 🌐 For General Users
If you want to use the application to find or report items, you do not need to perform any local setup or installation. Simply access the platform live in your browser:
👉 **[Visit the Live Application](https://lost-found-hub-mu.vercel.app)**

---

### 💻 For Developers (Local Setup)

If you wish to clone this repository and run a local instance of the application on your computer, follow the instructions below.

#### Prerequisites
- **Node.js** (v16+ recommended) installed.
- **MongoDB Atlas** cluster or a local MongoDB database.

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
   MONGO_URI=your_mongodb_connection_string
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

---

## ☁️ Deployment Guide

This MERN stack application is split into a frontend SPA and backend API server. They can be deployed separately to cloud hosting providers.

### 1. Deploy the Backend API (Render Example)
1. Sign in to [Render](https://render.com) and click **New > Web Service**.
2. Connect this GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in Render's console:
   - `MONGO_URI`: Your MongoDB connection string (e.g. `mongodb+srv://<user>:<password>@cluster.mongodb.net/dbName`).
   - `JWT_SECRET`: Any secure random string (e.g. `supersecretkey123`).
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service** and note down the generated URL (e.g. `https://lost-found-backend.onrender.com`).

### 2. Deploy the Frontend Client (Vercel Example)
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import this GitHub repository.
3. Configure the project settings:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add the following **Environment Variable**:
   - `REACT_APP_API_URL`: Set this to your deployed backend URL followed by `/api` (e.g., `https://lost-found-backend.onrender.com/api`).
5. Click **Deploy**. Vercel will build the application and host your static SPA client.

