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
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);
router.post('/sync', syncCart);

export default router;