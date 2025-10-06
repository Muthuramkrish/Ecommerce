import express from 'express';
import { 
 
  verifyToken,
  getUserProfile,
  getUserData,
} from '../../controller/user-mgmt.js';

const router = express.Router();


// Protected routes (require authentication)
router.use(verifyToken); // Apply middleware to all routes below

// User profile
router.get('/profile', getUserProfile);

// User data (profile, cart, and favorites)
router.get('/data', getUserData);


export default router;