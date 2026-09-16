import express from 'express';
import { getUserProfile, updateUserProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all user routes
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/change-password', changePassword);

export default router;
