import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/config/db.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import { initSocketHandlers } from "./src/socket/socketHandler.js";

// Routes imports
import authRoutes from "./src/modules/auth/authRoutes.js";
import verificationRoutes from "./src/modules/verification/verificationRoutes.js";
import adminRoutes from "./src/modules/admin/adminRoutes.js";
import restaurantRoutes from "./src/modules/restaurant/restaurantRoutes.js";
import ngoRoutes from "./src/modules/ngo/ngoRoutes.js";
import volunteerRoutes from "./src/modules/volunteer/volunteerRoutes.js";
import chatRoutes from "./src/modules/chat/chatRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

initSocketHandlers(io);

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow external image sources for demo maps & avatars
  })
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve uploaded static files
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Attach Socket.io instance to req for controllers if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "FoodBridge API is operational" });
});

app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/chat", chatRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 FoodBridge Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
});

export { app, io };
