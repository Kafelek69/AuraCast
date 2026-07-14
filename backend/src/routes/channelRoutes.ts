import { Router } from 'express';
import { createChannel, getMyStreamKey } from '../controllers/channelController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Zabezpieczamy ścieżki za pomocą middleware 'protect'
router.post('/create', protect, createChannel);
router.get('/my-key', protect, getMyStreamKey);

export default router;