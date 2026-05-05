# CABO — College Ride Sharing Platform

A full-stack web application that allows college students to share rides with others traveling in the same direction. Built with **Spring Boot** (backend) and **React + Vite** (frontend).

> **Note:** This is NOT a taxi service. Students who are already traveling somewhere post their ride, and others can join them.

---

## 🚀 Features

### Core
- **Create Ride** — Post your trip with car details (model, type, number), route, date/time, and available seats
- **Find Rides** — Search by from/to location and filter by date (IRCTC-style date selection)
- **Join Ride** — Join available rides; seat count auto-decrements with duplicate join prevention
- **Ride Details** — View driver name, car info, phone number, participants list

### Communication
- **Real-time Chat** — WebSocket-powered group chat for ride participants
- **Notifications** — Get notified when someone joins/leaves your ride

### Safety
- **Report Ride** — Report fake/misleading rides with reason selection (Fake Ride, Driver Not Responding, Wrong Information, Other)
- **Admin Dashboard** — View reported rides, manage users (warn/block/unblock), moderate content

### Authentication
- **JWT Authentication** — Secure login/register with email, phone, password
- **Role-based Access** — Student and Admin roles with route-level protection

---

## 🏗️ Architecture

```
cabo-backend/                          cabo-frontend/
├── src/main/java/com/cabo/           ├── src/
│   ├── config/                       │   ├── components/
│   │   ├── JwtFilter.java            │   ├── context/
│   │   ├── JwtUtil.java              │   ├── pages/
│   │   ├── SecurityConfig.java       │   │   ├── Home.jsx
│   │   └── WebSocketConfig.java      │   │   ├── Login.jsx
│   ├── controller/                   │   │   ├── Register.jsx
│   │   ├── AuthController.java       │   │   ├── Rides.jsx
│   │   ├── RideController.java       │   │   ├── CreateRide.jsx
│   │   ├── ChatController.java       │   │   ├── RideDetail.jsx
│   │   ├── ReportController.java     │   │   ├── Dashboard.jsx
│   │   ├── AdminController.java      │   │   ├── Profile.jsx
│   │   └── NotificationController    │   │   └── Admin.jsx
│   ├── service/                      │   ├── api.js
│   │   ├── RideService.java          │   ├── index.css
│   │   ├── ReportService.java        │   └── App.jsx
│   │   └── AdminService.java         └── package.json
│   ├── dto/
│   ├── entity/
│   └── repository/
└── pom.xml
```

**Clean Architecture Layers:**
- **Controller** → REST endpoints, request handling
- **Service** → Business logic, validation
- **Repository** → Database access (JPA)
- **DTO** → Data transfer objects
- **Entity** → JPA entities

---

## 🗄️ Database Schema

| Table | Key Fields |
|-------|-----------|
| **users** | id, name, email, phone, password, role, blocked, created_at |
| **rides** | id, driver_id, from_location, to_location, date, time, car_model, car_type, car_number, seats_available, total_seats, phone_number, notes, status |
| **bookings** | id, ride_id, user_id, joined_at (unique: ride_id + user_id) |
| **chat_messages** | id, ride_id, sender_id, content, timestamp |
| **reports** | id, ride_id, reported_by, reason, status, created_at |
| **notifications** | id, user_id, message, type, ride_id, is_read, created_at |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update name/phone |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rides?fromLocation=&toLocation=&date=` | Search rides (public) |
| POST | `/api/rides` | Create ride |
| GET | `/api/rides/{id}` | Get ride detail (public) |
| DELETE | `/api/rides/{id}` | Cancel ride |
| POST | `/api/rides/{id}/join` | Join ride |
| POST | `/api/rides/{id}/leave` | Leave ride |
| GET | `/api/rides/my` | My created & joined rides |
| POST | `/api/rides/{id}/report` | Report a ride |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rides/{id}/messages` | Get ride chat messages |
| POST | `/api/rides/{id}/messages` | Send message |
| WS | `/ws` (STOMP) → `/app/chat/{rideId}` | WebSocket real-time chat |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/rides` | List all rides + stats |
| DELETE | `/api/admin/rides/{id}` | Admin cancel ride |
| GET | `/api/admin/reports` | List all reports |
| PUT | `/api/admin/reports/{id}` | Update report status |
| PUT | `/api/admin/users/{id}/warn` | Warn user (notification) |
| PUT | `/api/admin/users/{id}/block` | Block user |
| PUT | `/api/admin/users/{id}/unblock` | Unblock user |

---

## 🛠️ Setup & Run

### Prerequisites
- Java 17+
- Node.js 18+
- (Optional) MySQL 8+ for production

### Backend
```bash
cd cabo-backend
./mvnw spring-boot:run
```
Backend starts at `http://localhost:8080`

**Default DB:** H2 (in-memory dev database, console at `/h2-console`)

**Switch to MySQL:**
```bash
./mvnw spring-boot:run -Dspring.profiles.active=mysql
```
Configure credentials in `src/main/resources/application-mysql.properties`.

### Frontend
```bash
cd cabo-frontend
npm install
npm run dev
```
Frontend starts at `http://localhost:5173`

### Admin Account
Register with email `admin@cabo.com` to get admin access automatically.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 3.2, Spring Security, Spring Data JPA, WebSocket (STOMP) |
| **Frontend** | React 19, Vite 7, React Router 7, Lucide Icons |
| **Auth** | JWT (jjwt 0.12.5), BCrypt |
| **Database** | H2 (dev) / MySQL (prod) |
| **Real-time** | STOMP WebSocket + SockJS |

---

## 📄 License

MIT
