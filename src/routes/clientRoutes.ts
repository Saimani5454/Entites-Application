import { Router } from 'express';
import { createClient, updateClient, listClients, getClient } from '../controllers/clientController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * POST /api/clients
 * Create a new client
 * Requires ROLE_ADMIN
 */
router.post('/clients', authenticateUser, requireAdmin, createClient);

/**
 * GET /api/clients
 * List all clients
 */
router.get('/clients', listClients);

/**
 * GET /api/clients/:id
 * Get a specific client
 */
router.get('/clients/:id', getClient);

/**
 * PATCH /api/clients/:id
 * Update client fields (partial update)
 */
router.patch('/clients/:id', updateClient);

export default router;
