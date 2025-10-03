import User from "../models/user.js";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";
import { validationResult } from "express-validator";
import crypto from "crypto";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      newsletter = true,
      smsNotifications = false,
      emailNotifications = true,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ "personalInfo.email": email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address",
      });
    }

    // Create user
    const user = new User({
      personalInfo: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
      },
      authentication: {
        password,
        emailVerificationToken: crypto.randomBytes(20).toString("hex"),
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      },
      profile: {
        preferences: {
          newsletter,
          smsNotifications,
          emailNotifications,
          language: "en",
          currency: "INR",
        },
      },
      tracking: {
        registrationSource: req.headers["user-agent"] ? "web" : "api",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        utmSource: req.body.utmSource,
        utmMedium: req.body.utmMedium,
        utmCampaign: req.body.utmCampaign,
      },
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.authentication.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });

    // TODO: Send email verification email
    console.log(`Email verification token for ${email}: ${user.authentication.emailVerificationToken}`);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error in user registration",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ "personalInfo.email": email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Check if account is active
    if (user.account.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is not active. Please contact support.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset login attempts on successful login
    if (user.authentication.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.authentication.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.authentication.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error in user login",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-authentication.password");

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      bio,
      newsletter,
      smsNotifications,
      emailNotifications,
      language,
      currency,
    } = req.body;

    const user = await User.findById(req.user._id);

    // Update personal info
    if (firstName) user.personalInfo.firstName = firstName.trim();
    if (lastName) user.personalInfo.lastName = lastName.trim();
    if (phone !== undefined) user.personalInfo.phone = phone?.trim();
    if (dateOfBirth) user.personalInfo.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.personalInfo.gender = gender;

    // Update profile
    if (bio !== undefined) user.profile.bio = bio?.trim();

    // Update preferences
    if (newsletter !== undefined) user.profile.preferences.newsletter = newsletter;
    if (smsNotifications !== undefined) user.profile.preferences.smsNotifications = smsNotifications;
    if (emailNotifications !== undefined) user.profile.preferences.emailNotifications = emailNotifications;
    if (language) user.profile.preferences.language = language;
    if (currency) user.profile.preferences.currency = currency;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.authentication.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.authentication.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      "authentication.emailVerificationToken": token,
      "authentication.emailVerificationExpires": { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark email as verified
    user.authentication.isEmailVerified = true;
    user.authentication.emailVerificationToken = undefined;
    user.authentication.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ "personalInfo.email": email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email address",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.authentication.passwordResetToken = resetToken;
    user.authentication.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // TODO: Send password reset email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing forgot password request",
      error: error.message,
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      "authentication.passwordResetToken": token,
      "authentication.passwordResetExpires": { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.authentication.password = password;
    user.authentication.passwordResetToken = undefined;
    user.authentication.passwordResetExpires = undefined;

    // Reset login attempts
    user.authentication.loginAttempts = 0;
    user.authentication.lockUntil = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

export default {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};