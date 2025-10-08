#!/usr/bin/env node
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import ProductListRouter from "./router/productList/productList.js";
import userRoutes from "./router/user/user.js";
import signUpRoutes from "./router/signUp/signUp.js";
import signInRoutes from "./router/signIn/signIn.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect Database (with error handling)
try {
  connectDB();
  console.log('✅ Database connection initiated');
} catch (error) {
  console.warn('⚠️ Database connection failed, but server will continue:', error.message);
}

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: 'Ecommerce Server is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug route to test server
app.get("/api/debug", (req, res) => {
  res.json({ 
    message: 'API Server is working!', 
    availableRoutes: [
      'GET /api/user/test',
      'GET /api/user/profile',
      'GET /api/user/data', 
      'GET /api/user/cart',
      'POST /api/user/cart',
      'PUT /api/user/cart/:productTitle',
      'DELETE /api/user/cart/:productTitle',
      'DELETE /api/user/cart',
      'GET /api/user/favorites',
      'POST /api/user/favorites',
      'DELETE /api/user/favorites/:productTitle'
    ],
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use("/api/productList", ProductListRouter);
app.use("/api/user", userRoutes);
app.use("/api/signUp", signUpRoutes);
app.use("/api/signIn", signInRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Debug URL: http://localhost:${PORT}/api/debug`);
  console.log(`👤 User Test URL: http://localhost:${PORT}/api/user/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});