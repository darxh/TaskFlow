# Task Management Application

A production-ready full-stack Task Management app with JWT authentication, AES encryption, and role-based access control.

Live Application: https://task-flow-iota-eight.vercel.app/
<br>
GitHub Repository: https://github.com/darxh/TaskFlow

## 🏗️ Architecture Overview

```
├── backend/          # Node.js + Express REST API
│   ├── controllers/  # Route handler logic
│   ├── middleware/   # Auth protection middleware
│   ├── models/       # Mongoose data models
│   ├── routes/       # API route definitions
│   └── server.js     # App entry point
│
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/      # Axios instance
        ├── components/ # Reusable components (ProtectedRoute)
        ├── context/  # Auth context (global state)
        └── pages/    # Login, Register, Dashboard
```

## 🔐 Security Implementation

- **JWT** stored in **HTTP-only cookies** (inaccessible to JavaScript, prevents XSS)
- **Secure + SameSite=Strict** cookie flags in production
- **bcrypt** password hashing (salt rounds: 10)
- **AES encryption** on task descriptions at rest (via `crypto-js`)
- **Authorization checks** on every mutating task operation (users can only modify their own tasks)
- **Input validation** on all API endpoints
- **CORS** restricted to known frontend origins only
- **Environment variables** for all secrets (never hardcoded)

## 🛠️ Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Backend    | Node.js, Express v5      |
| Database   | MongoDB (Mongoose ODM)   |
| Auth       | JWT + HTTP-only Cookies  |
| Encryption | CryptoJS (AES-256)       |
| Frontend   | React 19, Vite           |
| Styling    | Tailwind CSS v4          |
| HTTP Client| Axios                    |

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 20
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-management-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskmanager
JWT_SECRET=your_long_random_jwt_secret_key
ENCRYPTION_KEY=your_32_char_aes_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev       # Development (nodemon)
npm start         # Production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev       # Development server
npm run build     # Production build
```

---

## 📡 API Documentation

### Base URL
`http://localhost:5000/api`

All protected routes require a valid JWT cookie (set automatically on login).

---

### Auth Endpoints

#### `POST /auth/register`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "_id": "665f1a...",
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

#### `POST /auth/login`
Login and receive JWT cookie.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "_id": "665f1a...",
  "name": "John Doe",
  "email": "john@example.com"
}
```
> Sets `jwt` HTTP-only cookie automatically.

---

#### `POST /auth/logout`
Clear the JWT cookie.

**Response (200):**
```json
{ "message": "Logged out successfully" }
```

---

### Task Endpoints

> All task routes require authentication (JWT cookie).

#### `GET /tasks`
Get all tasks for the logged-in user. Supports pagination, filtering, and search.

**Query Parameters:**

| Param    | Type   | Description                              |
|----------|--------|------------------------------------------|
| `page`   | number | Page number (default: 1)                |
| `limit`  | number | Items per page (default: 10)            |
| `status` | string | Filter: `pending`, `in-progress`, `completed` |
| `search` | string | Search tasks by title (case-insensitive) |

**Example:** `GET /tasks?page=1&limit=5&status=pending&search=fix`

**Response (200):**
```json
{
  "tasks": [
    {
      "_id": "665f1b...",
      "user": "665f1a...",
      "title": "Fix login bug",
      "description": "Investigate the login timeout issue",
      "status": "pending",
      "createdAt": "2024-06-04T10:30:00.000Z",
      "updatedAt": "2024-06-04T10:30:00.000Z"
    }
  ],
  "page": 1,
  "pages": 3,
  "total": 25
}
```

---

#### `POST /tasks`
Create a new task.

**Request:**
```json
{
  "title": "Fix login bug",
  "description": "Investigate the login timeout issue",
  "status": "pending"
}
```

**Response (201):**
```json
{
  "_id": "665f1b...",
  "user": "665f1a...",
  "title": "Fix login bug",
  "description": "Investigate the login timeout issue",
  "status": "pending",
  "createdAt": "2024-06-04T10:30:00.000Z"
}
```

---

#### `PUT /tasks/:id`
Update an existing task (only owner can update).

**Request:**
```json
{
  "status": "in-progress",
  "title": "Fix login bug (urgent)"
}
```

**Response (200):**
```json
{
  "_id": "665f1b...",
  "title": "Fix login bug (urgent)",
  "description": "Investigate the login timeout issue",
  "status": "in-progress",
  "updatedAt": "2024-06-04T11:00:00.000Z"
}
```

---

#### `DELETE /tasks/:id`
Delete a task (only owner can delete).

**Response (200):**
```json
{
  "id": "665f1b...",
  "message": "Task deleted"
}
```

---

### Error Responses

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Bad request / validation error |
| 401    | Not authenticated              |
| 403    | Forbidden (not your resource)  |
| 404    | Resource not found             |
| 500    | Internal server error          |

**Error format:**
```json
{
  "message": "User not authorized"
}
```

---

## ☁️ Deployment Guide

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, set **root directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables (from your `.env`)
7. Set `NODE_ENV=production` and `FRONTEND_URL=<your-vercel-url>`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect GitHub repo, set **root directory** to `frontend`
3. Add environment variable: `VITE_API_BASE_URL=<your-render-backend-url>/api`
4. Deploy

> After both are deployed, update `FRONTEND_URL` in your Render backend env vars to your Vercel URL, then redeploy backend.

---

## 🧪 Health Check

```
GET /api/health
```
```json
{ "status": "success", "message": "API is running smoothly." }
```
