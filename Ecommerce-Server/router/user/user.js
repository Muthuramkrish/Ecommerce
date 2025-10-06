import express from 'express';
import { 
 
  verifyToken,
  getUserProfile,
} from '../../controller/user-mgmt.js';

const router = express.Router();


// Protected routes (require authentication)
router.use(verifyToken); // Apply middleware to all routes below

// User profile
router.get('/profile', getUserProfile);


export default router;