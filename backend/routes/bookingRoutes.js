import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    createBooking,
    getBookings,
    updateBookingStatus,
    getUserBookings
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.get('/', protect, admin, getBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);

export default router;
