import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import ProductListRouter from "./router/productList/productList.js";
import userRoutes from "./router/user/user.js";
import favoritesRoutes from "./router/favorites/favorites.js";
import cartRoutes from "./router/cart/cart.js";
import signUpRoutes from "./router/signUp/signUp.js";
import signInRoutes from "./router/signIn/signIn.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Routes
app.use("/api/productList", ProductListRouter);
app.use("/api/user", userRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/signUp", signUpRoutes);
app.use("/api/signIn", signInRoutes);

app.use("/api/user", favoritesRoutes);
app.use("/api/user", cartRoutes);

const PORT = 5000; // Fixed port for development

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});