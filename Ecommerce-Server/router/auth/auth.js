import express from "express";
import { register, login, getMe } from "../../controller/auth.js";
import { protect } from "../../middleware/auth.js";
import { validateRegister, validateLogin } from "../../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Protected routes
router.get("/me", protect, getMe);

export default router;