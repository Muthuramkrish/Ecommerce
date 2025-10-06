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

// Backward compatibility routes (redirect to new endpoints)
app.use("/api/signup", (req, res) => {
  // Redirect to new signup endpoint
  req.url = '/signup';
  userRoutes(req, res);
});

app.use("/api/signin", (req, res) => {
  // Redirect to new signin endpoint
  req.url = '/signin';
  userRoutes(req, res);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});