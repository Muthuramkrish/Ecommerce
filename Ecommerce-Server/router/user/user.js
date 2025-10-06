import express from 'express';
import { 
  signUp, 
  signIn,
  verifyToken,
  getUserProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getCart,
  clearCart,
  syncCart
} from '../../controller/user-mgmt.js';

const router = express.Router();

// Authentication routes
router.post('/signup', signUp);
router.post('/signin', signIn);

// Protected routes (require authentication)
router.use(verifyToken); // Apply middleware to all routes below

// User profile
router.get('/profile', getUserProfile);

// Favorites routes
router.get('/favorites', getFavorites);
router.post('/favorites', addToFavorites);
router.delete('/favorites/:productTitle', removeFromFavorites);

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:productTitle', updateCartQuantity);
router.delete('/cart/:productTitle', removeFromCart);
router.delete('/cart', clearCart);
router.post('/cart/sync', syncCart);

export default router;