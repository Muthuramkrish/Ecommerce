import express from 'express';
import { 
  verifyToken,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  
} from '../../controller/user-mgmt.js';

const router = express.Router();


// Protected routes (require authentication)
router.use(verifyToken); // Apply middleware to all routes below


// Favorites routes
router.get('/favorites', getFavorites);
router.post('/favorites', addToFavorites);
router.delete('/favorites/:productId', removeFromFavorites);

export default router;