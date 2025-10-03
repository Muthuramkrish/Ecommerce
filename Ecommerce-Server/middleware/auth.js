import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Generate JWT Token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Generate Refresh Token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key", {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

      // Get user from token
      const user = await User.findById(decoded.userId).select("-authentication.password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No user found with this token",
        });
      }

      // Check if user account is active
      if (user.account.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "User account is not active",
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(401).json({
          success: false,
          message: "Account is temporarily locked due to too many failed login attempts",
        });
      }

      // Update last active timestamp
      await user.updateLastActive();

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware",
      error: error.message,
    });
  }
};

// Middleware to check for specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    if (!roles.includes(req.user.account.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.account.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// Middleware to check for specific permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Admin role has all permissions
    if (req.user.account.role === "admin") {
      return next();
    }

    // Check if user has the specific permission
    if (!req.user.account.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' is required to access this route`,
      });
    }

    next();
  };
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

        // Get user from token
        const user = await User.findById(decoded.userId).select("-authentication.password");

        if (user && user.account.status === "active" && !user.isLocked) {
          await user.updateLastActive();
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log("Invalid token in optional auth:", error.message);
      }
    }

    next();
  } catch (error) {
    // Don't fail the request for optional auth
    next();
  }
};

export default {
  generateToken,
  generateRefreshToken,
  protect,
  authorize,
  checkPermission,
  optionalAuth,
};