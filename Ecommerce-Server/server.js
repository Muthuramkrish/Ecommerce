import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import ProductListRouter from "./router/productList/productList.js";
import userRoutes from "./router/user/user.js";

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

const PORT = 5000; // Fixed port for development

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});