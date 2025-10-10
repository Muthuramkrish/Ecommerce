import express from 'express';
import { 
  signUp,
  signIn,
  verifyToken,
  // getUserProfile,
  getUserData,
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

export default router;