import express from "express";
import {
  adminLogin,
  verifyToken,
  verifyAdmin,
  getAllUsers,
  getUserById,
  updateUserRole,
  changeUserStatus,
  getAllOrders,
  updateOrderStatus,
  getAllBulkOrders,
  updateBulkOrderStatus,
  deleteUser,
} from "../../controller/admin-mgmt.js";

const router = express.Router();

// Admin login
router.post("/login", adminLogin);

router.use(verifyToken);
router.use(verifyAdmin);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", changeUserStatus);
router.delete("/users/:id", deleteUser);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:userId/:orderId/status", updateOrderStatus);

// Bulk Orders
router.get("/bulk-orders", getAllBulkOrders);
router.put("/bulk-orders/:userId/:bulkOrderId/status", updateBulkOrderStatus);

export default router;
