# 🚗 CABO — College Ride Sharing Platform

![Tech](https://img.shields.io/badge/Stack-SpringBoot%20%7C%20React%20%7C%20Firebase-blue)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-green)

CABO is a **full-stack ride-sharing platform for college students**, enabling them to share rides with others traveling in the same direction.

> ⚠️ This is **NOT a taxi service** — users post rides they are already taking, and others can join.

---

## 🌐 Live Demo

* 🔗 Frontend: *(Add your deployed link here)*
* 🔗 Backend API: https://cabo-backend.onrender.com

---

## 📸 Screenshots
🏠 Home Page
<img width="1919" height="665" alt="Screenshot 2026-05-05 212042" src="https://github.com/user-attachments/assets/da094ad4-129f-49f5-9418-58174c939d74" />
<img width="1919" height="913" alt="Screenshot 2026-05-05 212100" src="https://github.com/user-attachments/assets/63ae7ee5-3a36-4c78-8a96-08a3e0e47580" />


🚗 Create Ride
<img width="1919" height="986" alt="Screenshot 2026-05-05 212256" src="https://github.com/user-attachments/assets/c96106cb-962c-4c8f-8ee5-b53228d46d6e" />

💬 Chat System
<img width="1919" height="987" alt="Screenshot 2026-05-05 212315" src="https://github.com/user-attachments/assets/ec6259b7-2527-48b1-aec1-22721e8b2812" />




---

## ✨ Features

### 🚀 Core Features

* Create and publish rides with full details
* Search rides by location & date (IRCTC-style)
* Join rides with real-time seat updates
* Prevent duplicate bookings

### 💬 Real-Time Communication

* WebSocket-based group chat for ride participants
* Instant messaging within rides

### 🔔 Notifications

* Get notified when someone joins/leaves your ride
* Admin warnings & updates

### 🛡️ Safety & Moderation

* Report fake or suspicious rides
* Admin dashboard for monitoring users & rides
* User blocking / warning system

### 🔐 Authentication

* Firebase Authentication (Email/Password)
* Secure session handling via Firebase SDK
* Protected frontend routes

---

## 🏗️ Architecture

```
Frontend (React + Vite)
        ↓
Firebase Auth (User Identity)
        ↓
Backend (Spring Boot REST API)
        ↓
Database (H2 / MySQL)
        ↓
WebSocket Server (Real-time Chat)
```

---

## 🧠 Tech Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| **Frontend**       | React, Vite, React Router          |
| **Backend**        | Spring Boot, Spring Security, JPA  |
| **Authentication** | Firebase Authentication            |
| **Database**       | H2 (Dev), MySQL (Prod)             |
| **Real-time**      | WebSocket (STOMP + SockJS)         |
| **Deployment**     | Render (Backend), *(Frontend TBD)* |

---

## 🔥 Firebase Integration

CABO uses **Firebase Authentication** for secure and scalable user management.

### Features:

* Email & Password Authentication
* Secure token-based session handling
* No custom auth backend required

### Environment Variables

Create a `.env` file in `cabo-frontend/`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

> ⚠️ Never commit `.env` to GitHub

---

## 📡 API Overview

### Auth

* `GET /api/auth/me` → Get current user
* *(Firebase handles login/signup)*

### Rides

* `GET /api/rides` → Search rides
* `POST /api/rides` → Create ride
* `POST /api/rides/{id}/join` → Join ride
* `POST /api/rides/{id}/leave` → Leave ride

### Chat

* `WS /ws` → Real-time messaging

### Admin

* Manage users, reports, and rides

---

## 🛠️ Setup & Run

### 🔧 Backend

```
cd cabo-backend
./mvnw spring-boot:run
```

Runs at: `http://localhost:8080`

---

### 💻 Frontend

```
cd cabo-frontend
npm install
npm run dev
```

Runs at: `http://localhost:5173`

---

## 🔐 Security Best Practices

* `.env` files are ignored using `.gitignore`
* Firebase API keys are restricted
* Role-based access control in backend
* Input validation & error handling implemented

---

## 🚀 Future Improvements

* Payment integration (optional)
* Ride history analytics
* Mobile app (Android/iOS)
* Google Maps integration

---

## 👨‍💻 Author

**Kuldeep Dhangad**

* GitHub: https://github.com/KDGIT005/CABO
* Project: CABO

---

## 📄 License

MIT License

---

⭐ If you like this project, consider giving it a star!
