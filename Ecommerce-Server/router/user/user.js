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

// Test route (no auth needed for debugging)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'User router is working!', 
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/user/test (this route)',
      'GET /api/user/profile',
      'GET /api/user/data',
      'GET /api/user/favorites',
      'POST /api/user/favorites',
      'DELETE /api/user/favorites/:productTitle',
      'GET /api/user/cart',
      'POST /api/user/cart',
      'PUT /api/user/cart/:productTitle',
      'DELETE /api/user/cart/:productTitle',
      'DELETE /api/user/cart'
    ]
  });
});

// Middleware for protected routes
router.use((req, res, next) => {
  // Skip auth for test route
  if (req.path === '/test') {
    return next();
  }
  verifyToken(req, res, next);
});

// User profile routes
router.get('/profile', (req, res) => {
  try {
    getUserProfile(req, res);
  } catch (error) {
    console.error('Error in /profile route:', error);
    res.status(500).json({ error: 'Internal server error in profile route' });
  }
});

router.get('/data', (req, res) => {
  try {
    getUserData(req, res);
  } catch (error) {
    console.error('Error in /data route:', error);
    res.status(500).json({ error: 'Internal server error in data route' });
  }
});

// Favorites routes
router.get('/favorites', (req, res) => {
  try {
    getFavorites(req, res);
  } catch (error) {
    console.error('Error in GET /favorites route:', error);
    res.status(500).json({ error: 'Internal server error in favorites route' });
  }
});

router.post('/favorites', (req, res) => {
  try {
    addToFavorites(req, res);
  } catch (error) {
    console.error('Error in POST /favorites route:', error);
    res.status(500).json({ error: 'Internal server error in add favorites route' });
  }
});

router.delete('/favorites/:productTitle', (req, res) => {
  try {
    removeFromFavorites(req, res);
  } catch (error) {
    console.error('Error in DELETE /favorites route:', error);
    res.status(500).json({ error: 'Internal server error in remove favorites route' });
  }
});

// Cart routes
router.get('/cart', (req, res) => {
  try {
    getCart(req, res);
  } catch (error) {
    console.error('Error in GET /cart route:', error);
    res.status(500).json({ error: 'Internal server error in cart route' });
  }
});

router.post('/cart', (req, res) => {
  try {
    addToCart(req, res);
  } catch (error) {
    console.error('Error in POST /cart route:', error);
    res.status(500).json({ error: 'Internal server error in add cart route' });
  }
});

router.put('/cart/:productTitle', (req, res) => {
  try {
    updateCartQuantity(req, res);
  } catch (error) {
    console.error('Error in PUT /cart route:', error);
    res.status(500).json({ error: 'Internal server error in update cart route' });
  }
});

router.delete('/cart/:productTitle', (req, res) => {
  try {
    removeFromCart(req, res);
  } catch (error) {
    console.error('Error in DELETE /cart/:productTitle route:', error);
    res.status(500).json({ error: 'Internal server error in remove cart item route' });
  }
});

router.delete('/cart', (req, res) => {
  try {
    clearCart(req, res);
  } catch (error) {
    console.error('Error in DELETE /cart route:', error);
    res.status(500).json({ error: 'Internal server error in clear cart route' });
  }
});

router.post('/cart/sync', (req, res) => {
  try {
    syncCart(req, res);
  } catch (error) {
    console.error('Error in POST /cart/sync route:', error);
    res.status(500).json({ error: 'Internal server error in sync cart route' });
  }
});

export default router;