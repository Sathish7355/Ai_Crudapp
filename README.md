# AI_Crudapp - Full-Stack Product Management Application

A modern, full-stack CRUD application built with **React.js (Vite)**, **Node.js**, **Express.js**, **MySQL**, and **JWT Authentication**.

---

## 🚀 Features

- **JWT Authentication**:
  - Secure user registration with password hashing (`bcryptjs`)
  - Login with JWT token generation and storage in `localStorage`
  - Automatic token expiration & 401 handling via Axios interceptors
  - Protected API routes and protected React routes (`<ProtectedRoute>`)
  - Logout with session cleanup
- **Product Management (CRUD)**:
  - **Create**: Add new products with title, category, price, stock quantity, and description
  - **Read**: View products with real-time statistics (Total count, total inventory valuation, in-stock items, out-of-stock items)
  - **Update**: Edit product details in a modal
  - **Delete**: Remove items with confirmation dialog
  - **Search & Filtering**: Search products by name/description, filter by category, and toggle "My Products Only"
  - **Switchable Views**: Seamlessly switch between **Table View** and **Grid View**
- **Automated MySQL Schema Setup**:
  - Backend automatically connects to MySQL, creates the database `ai_crudapp_db` if it doesn't exist, and initializes `users` and `products` tables with foreign keys and indexes on first launch.

---

## 📁 Project Structure

```
d:\Ai_Crudapp\
├── backend/
│   ├── config/
│   │   └── db.js               # MySQL connection pool & automatic table initialization
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Get Profile, Logout
│   │   └── productController.js# Product CRUD handlers
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/* endpoints
│   │   └── productRoutes.js    # /api/products/* endpoints
│   ├── .env                    # Environment variables (DB credentials, JWT Secret)
│   ├── .env.example            # Example configuration
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with user avatar and DB health indicator
│   │   │   ├── ProtectedRoute.jsx  # Route guard component
│   │   │   ├── ProductModal.jsx    # Create / Edit product modal
│   │   │   └── ConfirmDialog.jsx   # Delete confirmation modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global authentication provider
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Sign in view
│   │   │   ├── Register.jsx        # Sign up view
│   │   │   └── Dashboard.jsx       # Product CRUD & Inventory dashboard
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with JWT interceptor
│   │   ├── App.jsx                 # Client-side routing
│   │   ├── main.jsx                # React DOM entrypoint
│   │   └── index.css               # Styling and custom spinner
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── run-app.ps1                 # One-click launch script for Windows PowerShell
├── package.json                # Root package configuration
└── README.md
```

---

## ⚙️ Prerequisites & Setup

### 1. Configure MySQL Credentials
Open `backend/.env` and update `DB_PASSWORD` with your local MySQL root password:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_root_password
DB_NAME=ai_crudapp_db
JWT_SECRET=supersecretjwtkey_ai_crudapp_2026_dev
JWT_EXPIRES_IN=24h
```

> **Note**: You do **NOT** need to create the database manually! When the backend starts, it will automatically connect to MySQL, execute `CREATE DATABASE IF NOT EXISTS ai_crudapp_db;`, and create the `users` and `products` tables.

---

## 🏁 Running the Application

### Option 1: Quick PowerShell Script (Recommended)
From the root directory (`d:\Ai_Crudapp`), run:
```powershell
.\run-app.ps1
```
This script checks dependencies, installs any missing packages, and launches both backend and frontend servers in separate windows.

---

### Option 2: Manual Terminal Commands

#### Terminal 1 — Backend:
```powershell
cd d:\Ai_Crudapp\backend
npm install
npm run dev
```
Backend API will start at: **http://localhost:5000**  
Health check endpoint: **http://localhost:5000/api/health**

#### Terminal 2 — Frontend:
```powershell
cd d:\Ai_Crudapp\frontend
npm install
npm run dev
```
Frontend Web App will start at: **http://localhost:5173**

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user account (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Login user & return JWT token (`email`, `password`) | No |
| `GET`  | `/api/auth/me` | Fetch authenticated user details | Yes (Bearer Token) |
| `POST` | `/api/auth/logout` | Invalidate / clear session | Yes (Bearer Token) |

### Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/products` | Get list of products (query params: `search`, `category`, `mine`) | Yes (Bearer Token) |
| `GET`  | `/api/products/:id` | Get single product by ID | Yes (Bearer Token) |
| `POST` | `/api/products` | Create a new product | Yes (Bearer Token) |
| `PUT`  | `/api/products/:id` | Update product by ID (creator only) | Yes (Bearer Token) |
| `DELETE` | `/api/products/:id` | Delete product by ID (creator only) | Yes (Bearer Token) |

### System (`/api/health`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Service and MySQL connectivity status |

---

## 🧪 Testing Walkthrough

1. Open `http://localhost:5173` in your browser. You will be automatically redirected to `/login`.
2. Click **Create Account** to register a new user with your name, email, and password.
3. Upon registration, you are automatically logged in and redirected to the **Dashboard**.
4. In the top-right corner of the Dashboard, check the **MySQL Connected** pill to confirm database connectivity.
5. Click **Add New Product** to add items (e.g. "MacBook Pro M3", Category: "Electronics", Price: 1999.00, Stock: 15).
6. Try searching for products by name, filtering by category, or switching between **Table View** and **Grid View**.
7. Test the **Edit** and **Delete** buttons to verify update and delete capabilities.
8. Click **Logout** in the top navigation to test protected route enforcement (attempting to revisit `http://localhost:5173/` will redirect you to `/login`).
