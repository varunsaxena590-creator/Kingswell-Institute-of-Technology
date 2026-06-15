# Zentrix Institute of Technology — Full-Stack Web Application

A professional, modern full-stack college website built with **React + Tailwind CSS + Framer Motion** on the frontend and **Node.js + Express + MongoDB** on the backend. Features a 3D hero section, admin panel, role-based authentication, and Cloudinary image uploads.

---

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion     |
| 3D          | React Three Fiber (Three.js), @react-three/drei |
| Backend     | Node.js, Express.js                             |
| Database    | MongoDB + Mongoose                              |
| Auth        | JWT (JSON Web Tokens)                           |
| Images      | Cloudinary                                      |
| HTTP Client | Axios                                           |

---

## Project Structure

```
zentrix-college/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth & error handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── seed.js          # Database seeder
│   └── server.js        # App entry point
└── frontend/
    └── src/
        ├── admin/       # Admin panel pages
        ├── components/  # Reusable UI components
        ├── context/     # Auth context
        ├── pages/       # Public pages
        └── utils/       # Axios instance
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* in .env

# Start development server
npm run dev

# Seed the database with demo data
node seed.js
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 3. Access the App

| URL                           | Description |
| ----------------------------- | ----------- |
| `http://localhost:5173`       | Frontend    |
| `http://localhost:5000/api`   | Backend API |
| `http://localhost:5173/admin` | Admin Panel |

---

## Demo Credentials

| Role    | Email                | Password   |
| ------- | -------------------- | ---------- |
| Admin   | admin@zentrix.ac.ke   | admin123   |
| Student | student@zentrix.ac.ke | student123 |

> **Note:** Run `node seed.js` from the backend directory to create these accounts.

---

## API Endpoints

### Auth

| Method | Endpoint             | Access  |
| ------ | -------------------- | ------- |
| POST   | `/api/auth/register` | Public  |
| POST   | `/api/auth/login`    | Public  |
| GET    | `/api/auth/me`       | Private |

### Courses

| Method | Endpoint           | Access |
| ------ | ------------------ | ------ |
| GET    | `/api/courses`     | Public |
| POST   | `/api/courses`     | Admin  |
| PUT    | `/api/courses/:id` | Admin  |
| DELETE | `/api/courses/:id` | Admin  |

### Students / Admissions

| Method | Endpoint              | Access |
| ------ | --------------------- | ------ |
| POST   | `/api/students/apply` | Public |
| GET    | `/api/students`       | Admin  |
| PUT    | `/api/students/:id`   | Admin  |

### Contacts

| Method | Endpoint        | Access |
| ------ | --------------- | ------ |
| POST   | `/api/contacts` | Public |
| GET    | `/api/contacts` | Admin  |

### Gallery

| Method | Endpoint           | Access |
| ------ | ------------------ | ------ |
| GET    | `/api/gallery`     | Public |
| POST   | `/api/gallery`     | Admin  |
| DELETE | `/api/gallery/:id` | Admin  |

---

## Pages

| Page      | Route        | Description                      |
| --------- | ------------ | -------------------------------- |
| Home      | `/`          | Landing page with 3D hero        |
| About     | `/about`     | College history & values         |
| Courses   | `/courses`   | Browse all programmes            |
| Faculty   | `/faculty`   | Staff profiles                   |
| Gallery   | `/gallery`   | Photo gallery with lightbox      |
| Contact   | `/contact`   | Contact form                     |
| Admission | `/admission` | Multi-step application form      |
| Login     | `/login`     | User login                       |
| Register  | `/register`  | User registration                |
| Admin     | `/admin`     | Admin dashboard (role-protected) |

---

## Environment Variables

```env
# backend/.env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Features

- **Dark + Gold** professional UI theme
- **3D Hero** with animated sphere and orbit rings (React Three Fiber)
- **JWT Authentication** with role-based access (Admin/User)
- **Multi-step Admission Form** with validation
- **Responsive** — mobile-first design
- **Admin Panel** — manage students, courses, gallery
- **Cloudinary** image uploads with preview
- **Lightbox** gallery with keyboard navigation
- **Framer Motion** animations throughout
- **Form validation** on both frontend and backend
- **Global toast notifications** (react-hot-toast)

---

Built with care for developer portfolio purposes. © 2026 Zentrix Institute of Technology.
