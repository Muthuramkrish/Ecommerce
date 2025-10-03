import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../../controller/auth.js";
import { protect } from "../../middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerification,
} from "../../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.put("/reset-password/:token", validateResetPassword, resetPassword);
router.get("/verify-email/:token", validateEmailVerification, verifyEmail);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, validateProfileUpdate, updateProfile);
router.put("/change-password", protect, validateChangePassword, changePassword);
router.post("/logout", protect, logout);

export default router;