import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
} from '../controllers/roomController.js';

const router = express.Router();

router.get('/', getRooms);
router.post('/', protect, admin, createRoom);
router.put('/:id', protect, admin, updateRoom);
router.delete('/:id', protect, admin, deleteRoom);

export default router;
