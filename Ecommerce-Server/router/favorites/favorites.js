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
router.get('/', getFavorites);
// Add to favorites
router.post('/add', addToFavorites);

// Remove from favorites
router.delete('/:productId', removeFromFavorites);

export default router;