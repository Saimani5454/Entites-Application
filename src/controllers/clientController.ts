import { Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../database/connection';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^\d+$/.test(phone);

/**
 * Create client (POST)
 */
export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, userId, companyId } = req.body;
    if (!name || !email || !phone || !userId || !companyId) return res.status(400).json({ error: 'Missing required fields' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (!isValidPhone(phone)) return res.status(400).json({ error: 'Phone must contain only numbers' });

    const user = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const company = await dbGet('SELECT id FROM companies WHERE id = ? AND deletedAt IS NULL', [companyId]);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const existingClient = await dbGet('SELECT id FROM clients WHERE companyId = ? AND deletedAt IS NULL', [companyId]);
    if (existingClient) return res.status(409).json({ error: 'Company already assigned' });

    await dbRun('INSERT INTO clients (name,email,phone,userId,companyId,createdAt,updatedAt) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)', [name, email, phone, userId, companyId]);
    const newClient = await dbGet('SELECT * FROM clients WHERE companyId = ? ORDER BY id DESC LIMIT 1', [companyId]);

    res.status(201).json({ message: 'Client created successfully', client: newClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

/**
 * Update client (PATCH)
 */
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, userId, companyId } = req.body;

    const client = await dbGet('SELECT * FROM clients WHERE id = ? AND deletedAt IS NULL', [id]);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const updates: string[] = [];
    const values: any[] = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) { if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' }); updates.push('email = ?'); values.push(email); }
    if (phone) { if (!isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone' }); updates.push('phone = ?'); values.push(phone); }
    if (userId) { const u = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [userId]); if (!u) return res.status(404).json({ error: 'User not found' }); updates.push('userId = ?'); values.push(userId); }
    if (companyId) { const c = await dbGet('SELECT id FROM companies WHERE id = ? AND deletedAt IS NULL', [companyId]); if (!c) return res.status(404).json({ error: 'Company not found' }); const conflict = await dbGet('SELECT id FROM clients WHERE companyId = ? AND id != ? AND deletedAt IS NULL', [companyId, id]); if (conflict) return res.status(409).json({ error: 'Company already assigned' }); updates.push('companyId = ?'); values.push(companyId); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updatedAt = CURRENT_TIMESTAMP'); values.push(id);

    await dbRun(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`, values);
    const updatedClient = await dbGet('SELECT * FROM clients WHERE id = ?', [id]);

    res.json({ message: 'Client updated successfully', client: updatedClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

/**
 * List clients (GET)
 */
export const listClients = async (_req: Request, res: Response) => {
  try {
    const clients = await dbAll('SELECT * FROM clients WHERE deletedAt IS NULL ORDER BY createdAt DESC');
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list clients' });
  }
};

/**
 * Get specific client (GET /:id)
 */
export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await dbGet('SELECT * FROM clients WHERE id = ? AND deletedAt IS NULL', [id]);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get client' });
  }
};
