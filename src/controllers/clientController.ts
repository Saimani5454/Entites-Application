import { Request, Response } from 'express';
import { dbGet, dbRun, dbAll } from '../database/connection';
import { isValidEmail, isValidPhone } from '../utils/validators';

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
    if (existingClient) return res.status(409).json({ error: 'Company is already assigned to another client' });

    await dbRun('INSERT INTO clients (name, email, phone, userId, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [name, email, phone, userId, companyId]);
    const newClient = await dbGet(`SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId, co.name as companyName, u.username FROM clients c JOIN companies co ON c.companyId = co.id JOIN users u ON c.userId = u.id WHERE c.companyId = ? ORDER BY c.id DESC LIMIT 1`, [companyId]);
    res.status(201).json({ message: 'Client created successfully', client: newClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, userId, companyId } = req.body;

    const existingClient = await dbGet('SELECT * FROM clients WHERE id = ? AND deletedAt IS NULL', [id]);
    if (!existingClient) return res.status(404).json({ error: 'Client not found' });

    if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (phone && !isValidPhone(phone)) return res.status(400).json({ error: 'Phone must contain only numbers' });

    if (userId) {
      const user = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [userId]);
      if (!user) return res.status(404).json({ error: 'User not found' });
    }

    if (companyId) {
      const company = await dbGet('SELECT id FROM companies WHERE id = ? AND deletedAt IS NULL', [companyId]);
      if (!company) return res.status(404).json({ error: 'Company not found' });

      const anotherClient = await dbGet('SELECT id FROM clients WHERE companyId = ? AND id != ? AND deletedAt IS NULL', [companyId, id]);
      if (anotherClient) return res.status(409).json({ error: 'Company is already assigned to another client' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (userId !== undefined) { updates.push('userId = ?'); values.push(userId); }
    if (companyId !== undefined) { updates.push('companyId = ?'); values.push(companyId); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updatedAt = CURRENT_TIMESTAMP'); values.push(id);

    await dbRun(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`, values);
    const updatedClient = await dbGet(`SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId, co.name as companyName, u.username FROM clients c JOIN companies co ON c.companyId = co.id JOIN users u ON c.userId = u.id WHERE c.id = ?`, [id]);

    res.json({ message: 'Client updated successfully', client: updatedClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

export const listClients = async (req: Request, res: Response) => {
  try {
    const clients = await dbAll(`SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId, co.name as companyName, u.username FROM clients c JOIN companies co ON c.companyId = co.id JOIN users u ON c.userId = u.id WHERE c.deletedAt IS NULL ORDER BY c.createdAt DESC`);
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list clients' });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await dbGet(`SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId, co.name as companyName, u.username, c.createdAt, c.updatedAt FROM clients c JOIN companies co ON c.companyId = co.id JOIN users u ON c.userId = u.id WHERE c.id = ? AND c.deletedAt IS NULL`, [id]);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get client' });
  }
};
