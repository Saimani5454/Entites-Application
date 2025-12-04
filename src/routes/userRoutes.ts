import { Router } from 'express';
import { getUserProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/profile', requireAuth, getUserProfile);

export default router;
