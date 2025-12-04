import { Router } from 'express';
import { createClient, updateClient, listClients, getClient } from '../controllers/clientController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/clients', requireAuth, requireAdmin, createClient);
router.patch('/clients/:id', requireAuth, requireAdmin, updateClient);
router.get('/clients', listClients);
router.get('/clients/:id', getClient);

export default router;
