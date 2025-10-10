import express from 'express';
import { 

  verifyToken,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getCart,
  clearCart,
  syncCart
} from '../../controller/user-mgmt.js';

const router = express.Router();


// Protected routes (require authentication)
router.use(verifyToken); // Apply middleware to all routes below

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:productId', updateCartQuantity);
router.delete('/cart/:productId', removeFromCart);
router.delete('/cart', clearCart);
router.post('/cart/sync', syncCart);

export default router;