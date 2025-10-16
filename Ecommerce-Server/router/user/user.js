import express from 'express';
import { 
  signUp,
  signIn,
  verifyToken,
  // getUserProfile,
  getUserData,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  createBulkOrder,
  getUserBulkOrders,
  getBulkOrderById,
  updateBulkOrderStatus,
} from '../../controller/user-mgmt.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', signUp);
router.post('/signin', signIn);

// Protected routes (require authentication)
router.use(verifyToken); // Apply middleware to all routes below

// // User profile
// router.get('/profile', getUserProfile);

// User data (profile, cart, and favorites)
router.get('/data', getUserData);

// Order/Checkout routes
router.post('/orders', createOrder);
router.get('/orders', getUserOrders);
router.get('/orders/:orderId', getOrderById);
router.put('/orders/:orderId/status', updateOrderStatus);

// Bulk Order routes
router.post('/bulk-orders', createBulkOrder);
router.get('/bulk-orders', getUserBulkOrders);
router.get('/bulk-orders/:bulkOrderId', getBulkOrderById);
router.put('/bulk-orders/:bulkOrderId/status', updateBulkOrderStatus);

export default router;