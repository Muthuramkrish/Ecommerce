import express from 'express';
import { 
  signUp,
  signIn,
  verifyToken,
  getUserData,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderShipping,
  createBulkOrder,
  getUserBulkOrders,
  getBulkOrderById,
  updateBulkOrderStatus,
  updateBulkOrderCompanyInfo,
  cancelUserOrder,
  returnUserOrder,
  cancelUserBulkOrder,
  saveAddress,
  getAddresses,
  deleteAddress,
  saveCompanyAddress,
  getCompanyAddresses,
  deleteCompanyAddress
} from '../../controller/user-mgmt.js';

const router = express.Router();

// ✅ Public routes (no token needed)
router.post('/signup', signUp);
router.post('/signin', signIn);

// ✅ Protected routes (require valid token)
router.use(verifyToken);

router.get('/data', getUserData);

// 🏠 Address Management
router.get('/addresses', getAddresses);
router.post('/addresses', saveAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Company Address Management
router.post('/company-addresses', saveCompanyAddress);
router.get('/company-addresses', getCompanyAddresses);
router.delete('/company-addresses/:addressId', deleteCompanyAddress);

// Orders
router.post('/orders', createOrder);
router.get('/orders', getUserOrders);
router.get('/orders/:orderId', getOrderById);
router.put('/orders/:orderId/status', updateOrderStatus);
router.put('/orders/:orderId/shipping', updateOrderShipping); 
router.put('/orders/:orderId/cancel', cancelUserOrder);
router.put('/orders/:orderId/return', returnUserOrder);

// Bulk Orders
router.post('/bulk-orders', createBulkOrder);
router.get('/bulk-orders', getUserBulkOrders);
router.get('/bulk-orders/:bulkOrderId', getBulkOrderById);
router.put('/bulk-orders/:bulkOrderId/status', updateBulkOrderStatus);
router.put('/bulk-orders/:bulkOrderId/company-info', updateBulkOrderCompanyInfo); 
router.put('/bulk-orders/:bulkOrderId/cancel', cancelUserBulkOrder);

export default router;
