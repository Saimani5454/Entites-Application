import { Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../database/connection';
import { isValidEmail, isValidPhone } from '../utils/validators';

/**
 * Create a new client
 * POST /api/clients
 * Restricted to ROLE_ADMIN
 */
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, userId, companyId } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !userId || !companyId) {
      res.status(400).json({
        error: 'Missing required fields: name, email, phone, userId, companyId'
      });
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate phone format (numbers only)
    if (!isValidPhone(phone)) {
      res.status(400).json({ error: 'Phone must contain only numbers' });
      return;
    }

    // Check if user exists
    const user = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [userId]);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if company exists
    const company = await dbGet('SELECT id FROM companies WHERE id = ? AND deletedAt IS NULL', [companyId]);
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Check if company is already assigned to another client
    const existingClient = await dbGet(
      'SELECT id FROM clients WHERE companyId = ? AND deletedAt IS NULL',
      [companyId]
    );
    if (existingClient) {
      res.status(409).json({ error: 'Company is already assigned to another client' });
      return;
    }

    // Create client
    await dbRun(
      `INSERT INTO clients (name, email, phone, userId, companyId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, email, phone, userId, companyId]
    );

    // Get the created client
    const newClient = await dbGet(
      `SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId, 
              co.name as companyName, u.username
       FROM clients c
       JOIN companies co ON c.companyId = co.id
       JOIN users u ON c.userId = u.id
       WHERE c.companyId = ? ORDER BY c.id DESC LIMIT 1`,
      [companyId]
    );

    res.status(201).json({
      message: 'Client created successfully',
      client: newClient
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

/**
 * Update client fields (PATCH)
 * PATCH /api/clients/:id
 * Allows partial updates
 */
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, userId, companyId } = req.body;

    // Check if client exists
    const existingClient = await dbGet(
      'SELECT * FROM clients WHERE id = ? AND deletedAt IS NULL',
      [id]
    );
    if (!existingClient) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      res.status(400).json({ error: 'Phone must contain only numbers' });
      return;
    }

    // Validate userId if provided
    if (userId) {
      const user = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [userId]);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
    }

    // Validate companyId if provided
    if (companyId) {
      const company = await dbGet('SELECT id FROM companies WHERE id = ? AND deletedAt IS NULL', [companyId]);
      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      // Check if company is already assigned to another client
      const anotherClient = await dbGet(
        'SELECT id FROM clients WHERE companyId = ? AND id != ? AND deletedAt IS NULL',
        [companyId, id]
      );
      if (anotherClient) {
        res.status(409).json({ error: 'Company is already assigned to another client' });
        return;
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (userId !== undefined) {
      updates.push('userId = ?');
      values.push(userId);
    }
    if (companyId !== undefined) {
      updates.push('companyId = ?');
      values.push(companyId);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedClient = await dbGet(
      `SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId,
              co.name as companyName, u.username
       FROM clients c
       JOIN companies co ON c.companyId = co.id
       JOIN users u ON c.userId = u.id
       WHERE c.id = ?`,
      [id]
    );

    res.json({
      message: 'Client updated successfully',
      client: updatedClient
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

/**
 * Get all clients
 * GET /api/clients
 */
export const listClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await dbAll(
      `SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId,
              co.name as companyName, u.username
       FROM clients c
       JOIN companies co ON c.companyId = co.id
       JOIN users u ON c.userId = u.id
       WHERE c.deletedAt IS NULL
       ORDER BY c.createdAt DESC`
    );

    res.json(clients);
  } catch (error) {
    console.error('Error listing clients:', error);
    res.status(500).json({ error: 'Failed to list clients' });
  }
};

/**
 * Get a specific client
 * GET /api/clients/:id
 */
export const getClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await dbGet(
      `SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId,
              co.name as companyName, u.username, c.createdAt, c.updatedAt
       FROM clients c
       JOIN companies co ON c.companyId = co.id
       JOIN users u ON c.userId = u.id
       WHERE c.id = ? AND c.deletedAt IS NULL`,
      [id]
    );

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({ error: 'Failed to get client' });
  }
};
