import { Router } from 'express';
import { createClient, updateClient, listClients, getClient } from '../controllers/clientController';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/clients
 * Create a new client (admin only)
 */
router.post('/clients', requireAuth, requireAdmin, createClient);

/**
 * PATCH /api/clients/:id
 * Partial update of client (admin only)
 */
router.patch('/clients/:id', requireAuth, requireAdmin, updateClient);

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

export default router;
