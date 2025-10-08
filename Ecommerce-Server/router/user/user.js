import express from 'express';
import { 
 
  verifyToken,
  getUserProfile,
  getUserData,
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


// Protected routes (require authentication)
router.use(verifyToken); // Apply middleware to all routes below

// User profile
router.get('/profile', getUserProfile);

// User data (profile, cart, and favorites)
router.get('/data', getUserData);

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