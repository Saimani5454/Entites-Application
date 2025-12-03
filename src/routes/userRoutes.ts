import { Router } from 'express';
import { listUsers, replaceUser, getUserProfile } from '../controllers/userController';
import { authenticateUser, requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/users
 * List all users with optional username filter
 * Query: ?username=search_term
 */
router.get('/users', listUsers);

/**
 * PUT /api/users/:id
 * Replace entire user object
 */
router.put('/users/:id', replaceUser);

/**
 * GET /user/profile
 * Get authenticated user's profile with email validation
 */
router.get('/user/profile', authenticateUser, requireAuth, getUserProfile);

export default router;
