// server.js - CLEANED UP VERSION
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import ProductListRouter from "./router/productList/productList.js";
import userRoutes from "./router/user/user.js";
import favoritesRoutes from "./router/favorites/favorites.js";
import cartRoutes from "./router/cart/cart.js";
import adminRoutes from "./router/admin/admin.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Routes
app.use("/api/productList", ProductListRouter);
app.use("/api/user", userRoutes);        // Handles signup, signin, profile, data
app.use("/api/user", favoritesRoutes);
app.use("/api/user", cartRoutes);
app.use("/api/admin", adminRoutes);
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});