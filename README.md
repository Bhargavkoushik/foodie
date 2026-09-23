# 🍽️ Foodie — Full-Stack MERN Food Ordering Platform

A complete, modern food ordering web application built with **React**, **Express.js**, and **MongoDB**. Foodie provides an end-to-end experience for both customers and restaurant administrators, featuring dynamic menu search, cart management, checkout, order tracking, and a dedicated role-based admin dashboard.

---

## ✨ Features

### Customer Storefront
- **Dynamic Search & Filtering**: Fast search across dish names, categories, and descriptions with live suggestions, Veg/Non-Veg toggles, and price sorting.
- **Cart & Wishlist**: Real-time quantity controls, persistent state, and quick checkout flow.
- **Order Management**: Order placement, order history tracking, and order status updates.
- **Account & Profile**: User authentication, profile updates, and saved address management.
- **Responsive Design**: Mobile-friendly layout with light/dark theme support.

### Admin Dashboard (`/admin/login` & `/admin`)
- **Dedicated Admin Login**: Gated portal requiring verified administrative credentials.
- **Food Catalog Management**: Add new dishes with image uploads, list existing items, and delete menu items.
- **Order Processing**: Real-time order monitoring and status management (`Food Processing`, `Out for delivery`, `Delivered`, `Cancelled`).
- **Role-Based Security (RBAC)**: Backend-enforced authorization ensuring customer tokens cannot access administrative operations (HTTP 403 Forbidden).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Context API, Lucide & React Icons, Vanilla CSS
- **Backend**: Node.js, Express.js, MongoDB & Mongoose, JSON Web Tokens (JWT), Multer, Bcrypt
- **Database**: MongoDB Atlas / Local MongoDB

---

## 📁 Project Structure

```
Foodie/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Request controllers (auth, food, order, user)
│   ├── middlewares/        # JWT auth and admin RBAC middlewares
│   ├── models/             # Mongoose schemas (User, Food, Order, Cart, Review)
│   ├── routes/             # REST API routes
│   ├── scripts/            # Admin seeding utility (seedAdmin.js)
│   ├── uploads/            # Uploaded dish images
│   └── server.js           # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── admin/          # Role-based Admin Dashboard & Login
│   │   ├── assets/         # Images and icons
│   │   ├── components/     # Reusable UI components (Navbar, SearchBar, FoodDisplay)
│   │   ├── context/        # Store and Theme context providers
│   │   ├── lib/            # API client configuration (apiRequest.js)
│   │   ├── pages/          # Customer views (Home, Cart, PlaceOrder, MyOrder)
│   │   └── App.jsx         # Main router and route guards
│   ├── index.html
│   └── vite.config.js
├── images/                 # Application screenshots
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas cluster)

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create your .env file from the provided example
cp .env.example .env
```

Configure your `backend/.env` with your settings:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@foodie.com
ADMIN_PASSWORD=your_secure_admin_password
```

Seed the administrator account and start the server:
```bash
# Seed initial administrator account into MongoDB
npm run seed:admin

# Start the backend server
npm start
```
The backend API will run on `http://localhost:4000`.

---

### 2. Frontend Setup

```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend application will run on `http://localhost:5173`.

---

## 🔐 Credentials & Access

- **Customer Storefront**: `http://localhost:5173/`
  - Create a customer account using the **Sign In** popup.
- **Admin Portal**: `http://localhost:5173/admin/login`
  - **Default Email**: `admin@foodie.com`
  - **Password**: Configured in `ADMIN_PASSWORD` (seeded via `npm run seed:admin`)

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).
