import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
    loginUser, 
    registerUser, 
    getUserProfile,
    updateUserProfile,
    getUsers,
    updateWallet 
} from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, admin, getUsers);
router.put('/wallet', protect, updateWallet);

export default router;
