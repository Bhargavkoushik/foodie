import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// middleware
app.use(express.json());
app.use(cookieParser());

// Static file serving for uploads
app.use("/images", express.static(uploadsDir));

// CORS configuration supporting Vite/React local dev ports and production deployments
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:3000",
  "https://foodie-cyan-alpha.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      // Check allowed list, localhost regex, or vercel.app deployments
      if (
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      // Disallow origin cleanly without throwing unhandled server error
      return callback(null, false);
    },
    credentials: true,
  })
);

// db connection with fail-fast startup guarantee
try {
  await connectDB();
} catch (error) {
  console.error("\n❌ FATAL: Backend startup aborted due to MongoDB connection failure.");
  console.error("👉 Please ensure MONGODB_URI is correctly configured in your environment.");
  console.error(`👉 Error details: ${error.message}\n`);
  process.exit(1);
}

// Safe health check endpoint for monitoring (Render, Pingers, Status checks)
app.get("/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  }
  return res.status(503).json({
    status: "error",
    database: "disconnected",
  });
});

// Root welcome check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Foodie API is running" });
});

// api endpoints
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`server started on port ${PORT}`);
});

// Graceful port conflict and listen error handling
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`👉 Another process is already running on port ${PORT}.`);
    console.error(`👉 Run 'Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force' in PowerShell to free it, or choose another PORT in backend/.env.\n`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

// Graceful process termination
process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
