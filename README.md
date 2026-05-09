# 🚗 CABO — College Ride Sharing Platform

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![SpringBoot](https://img.shields.io/badge/Backend-SpringBoot-6DB33F)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Firebase](https://img.shields.io/badge/Auth-Firebase-FFCA28)
![Deployment](https://img.shields.io/badge/Deployment-Render%20%2B%20Vercel-black)
![Status](https://img.shields.io/badge/Status-Live-success)

CABO is a **full-stack ride-sharing platform built for college students**, allowing users traveling in the same direction to connect and share rides safely and efficiently.

> ⚠️ CABO is **not a taxi booking service**.  
> Users post rides they are already taking, and others can join those rides.

---

# 🌐 Live Deployment

| Service | Link |
|---|---|
| 🚀 Frontend | https://cabo-two.vercel.app |
| ⚙️ Backend API | https://cabo-backend.onrender.com |

---

# 📸 Screenshots

## 🏠 Home Page

<img width="1919" height="665" alt="Home" src="https://github.com/user-attachments/assets/da094ad4-129f-49f5-9418-58174c939d74" />

<img width="1919" height="913" alt="Home2" src="https://github.com/user-attachments/assets/63ae7ee5-3a36-4c78-8a96-08a3e0e47580" />

---

## 🚗 Create Ride

<img width="1919" height="986" alt="CreateRide" src="https://github.com/user-attachments/assets/c96106cb-962c-4c8f-8ee5-b53228d46d6e" />

---

## 💬 Real-Time Chat

<img width="1919" height="987" alt="Chat" src="https://github.com/user-attachments/assets/ec6259b7-2527-48b1-aec1-22721e8b2812" />

---

# ✨ Features

## 🚀 Ride Management

- Create and publish rides
- Search rides by location and date
- Join or leave rides
- Real-time seat availability updates
- Duplicate booking prevention

---

## 💬 Real-Time Communication

- WebSocket-powered ride chat
- Instant messaging between ride participants
- STOMP + SockJS integration

---

## 🔔 Notifications & Moderation

- Ride join/leave notifications
- User reporting system
- Admin moderation tools
- Warning and blocking system

---

## 🔐 Authentication & Security

- Firebase Authentication
- Email & Password login
- Protected frontend routes
- JWT-secured backend APIs
- Role-based access control

---

# 🏗️ System Architecture

```text
React + Vite Frontend
        ↓
Firebase Authentication
        ↓
Spring Boot REST API
        ↓
PostgreSQL (Supabase)
        ↓
WebSocket Chat System
```

---

# 🧠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Spring Boot, Spring Security, Spring Data JPA |
| Database | PostgreSQL (Supabase) |
| Authentication | Firebase Authentication |
| Real-Time Communication | WebSocket, STOMP, SockJS |
| Deployment | Render, Vercel |
| ORM | Hibernate |
| Build Tools | Maven, npm |
| Version Control | Git & GitHub |

---

# ☁️ Cloud Deployment

## Backend Deployment
- Dockerized Spring Boot application
- Hosted on Render
- PostgreSQL connection pooling via Supabase
- Environment-variable based production configuration

## Frontend Deployment
- Hosted on Vercel
- Automatic CI/CD deployment from GitHub

---

# 🔄 CI/CD Workflow

CABO uses a simple production-style CI/CD workflow:

```text
Git Push
   ↓
GitHub Repository
   ↓
Render/Vercel Auto Build
   ↓
Automatic Deployment
```

Every push to the `main` branch automatically redeploys the application.

---

# 🔥 Firebase Integration

CABO uses Firebase Authentication for secure user identity management.

## Supported Features

- Email/Password Authentication
- Secure token-based sessions
- Authorized domain protection

---

# 📡 API Overview

## Authentication
- `GET /api/auth/me`

## Rides
- `GET /api/rides`
- `POST /api/rides`
- `POST /api/rides/{id}/join`
- `POST /api/rides/{id}/leave`

## Chat
- `WS /ws`

## Admin
- User moderation
- Ride monitoring
- Reports management

---

# 🛠️ Local Development Setup

## 🔧 Backend

```bash
cd cabo-backend
./mvnw spring-boot:run
```

Runs on:
```text
http://localhost:8080
```

---

## 💻 Frontend

```bash
cd cabo-frontend
npm install
npm run dev
```

Runs on:
```text
http://localhost:5173
```

---

# 🌍 Environment Variables

## Frontend (`cabo-frontend/.env`)

```env
VITE_API_URL=your_backend_url
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

# 🔐 Security Best Practices

- `.env` excluded via `.gitignore`
- Firebase authorized domains configured
- JWT-protected backend routes
- CORS protection enabled
- Input validation implemented

---

# 🚀 Future Improvements

- Google Maps integration
- Mobile application
- Ride analytics dashboard
- Push notifications
- AI-based ride recommendations

---

# 👨‍💻 Author

## Kuldeep Dhangad

- GitHub: https://github.com/KDGIT005
- Project Repository: https://github.com/KDGIT005/CABO

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
