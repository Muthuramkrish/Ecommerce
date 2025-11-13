import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * ===========================
 * 🧩 ADMIN MANAGEMENT CONTROLLER
 * Handles: Authentication, Admin Access, Users, Orders, Bulk Orders
 * ===========================
 */

/* -------------------------------------------------------------------------- */
/* 🧱 AUTHENTICATION: ADMIN LOGIN */
/* -------------------------------------------------------------------------- */

// ✅ Admin Login (separate from regular user login)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check admin privileges
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Verify password
    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return response
    res.status(200).json({
      message: "Admin login successful",
      admin: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      token,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error during login", error: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧱 MIDDLEWARE SECTION */
/* -------------------------------------------------------------------------- */

// ✅ Verify JWT token
export const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// âœ… Verify Admin or SuperAdmin role
export const verifyAdmin = async (req, res, next) => {
  try {
    console.log('🔍 Verifying admin. Token user ID:', req.user.id);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('❌ Admin user not found in database. ID:', req.user.id);
      return res.status(404).json({ 
        message: "User not found. Please log in again.",
      });
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
      console.error('❌ User is not admin. Email:', user.email, 'Role:', user.role);
      return res.status(403).json({ 
        message: "Access denied. Admins only." 
      });
    }

    if (user.status !== 'active') {
      console.error('❌ Admin account is not active. Status:', user.status);
      return res.status(403).json({ 
        message: "Admin account is not active" 
      });
    }

    console.log('✅ Admin verified:', user.email);
    req.admin = user;
    next();
  } catch (err) {
    console.error('❌ Error in verifyAdmin:', err);
    res.status(500).json({ 
      message: "Server error verifying admin", 
      error: err.message 
    });
  }
};
/* -------------------------------------------------------------------------- */
/* 🧱 ADMIN OPERATIONS */
/* -------------------------------------------------------------------------- */

// ✅ 1. Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// ✅ 2. Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};

// ✅ 3. Update user role or permissions
export const updateUserRole = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, permissions },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User role/permissions updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// ✅ 4. Change user account status
export const changeUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // active / inactive / suspended
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: `User status updated to ${status}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user status", error: err.message });
  }
};

// ✅ 5. Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const users = await User.find({ "orders.0": { $exists: true } })
      .select("fullName email orders")
      .lean();

    const orders = users.flatMap(user =>
      user.orders.map(order => ({
        userId: user._id,
        userName: user.fullName,
        email: user.email,
        ...order,
      }))
    );

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// ✅ 6. Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    const { status, trackingId, estimatedDelivery } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = user.orders.find(o => o.orderId === orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    Object.assign(order, {
      status: status || order.status,
      trackingId: trackingId || order.trackingId,
      estimatedDelivery: estimatedDelivery || order.estimatedDelivery,
    });

    await user.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order", error: err.message });
  }
};

// ✅ 7. Get all bulk orders
export const getAllBulkOrders = async (req, res) => {
  try {
    const users = await User.find({ "bulkOrders.0": { $exists: true } })
      .select("fullName email bulkOrders")
      .lean();

    const bulkOrders = users.flatMap(user =>
      user.bulkOrders.map(order => ({
        userId: user._id,
        userName: user.fullName,
        email: user.email,
        ...order,
      }))
    );

    res.status(200).json(bulkOrders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bulk orders", error: err.message });
  }
};

// ✅ 8. Update bulk order status
export const updateBulkOrderStatus = async (req, res) => {
  try {
    const { userId, bulkOrderId } = req.params;
    const { status, priority, quotedPrice, quotedBy, notes, expectedDelivery } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const bulkOrder = user.bulkOrders.find(o => o.bulkOrderId === bulkOrderId);
    if (!bulkOrder) return res.status(404).json({ message: "Bulk order not found" });

    Object.assign(bulkOrder, {
      status: status || bulkOrder.status,
      priority: priority || bulkOrder.priority,
      quotedPrice: quotedPrice ?? bulkOrder.quotedPrice,
      quotedBy: quotedBy || bulkOrder.quotedBy,
      notes: notes || bulkOrder.notes,
      expectedDelivery: expectedDelivery || bulkOrder.expectedDelivery,
    });

    await user.save();
    res.status(200).json({ message: "Bulk order updated successfully", bulkOrder });
  } catch (err) {
    res.status(500).json({ message: "Failed to update bulk order", error: err.message });
  }
};

// ✅ 9. Delete user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};
