import { Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../database/connection';

/**
 * List all users (optional ?username)
 */
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    let query = 'SELECT id, username, email, role, createdAt FROM users WHERE deletedAt IS NULL';
    const params: any[] = [];

    if (username) {
      query += ' AND username = ?';
      params.push(username);
    }

    query += ' ORDER BY createdAt DESC';
    const users = await dbAll(query, params);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Replace entire user (PUT)
 */
export const replaceUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) return res.status(400).json({ error: 'Missing required fields' });
    if (!['ROLE_USER', 'ROLE_ADMIN'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const existingUser = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [id]);
    if (!existingUser) return res.status(404).json({ error: 'User not found' });

    // Duplicate checks
    const duplicateUsername = await dbGet('SELECT id FROM users WHERE username = ? AND id != ? AND deletedAt IS NULL', [username, id]);
    if (duplicateUsername) return res.status(409).json({ error: 'Username already exists' });

    const duplicateEmail = await dbGet('SELECT id FROM users WHERE email = ? AND id != ? AND deletedAt IS NULL', [email, id]);
    if (duplicateEmail) return res.status(409).json({ error: 'Email already exists' });

    await dbRun('UPDATE users SET username = ?, email = ?, password = ?, role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [username, email, password, role, id]);
    const updatedUser = await dbGet('SELECT id, username, email, role, createdAt, updatedAt FROM users WHERE id = ?', [id]);

    res.json({ message: 'User replaced successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to replace user' });
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await dbGet('SELECT id, username, email, role, createdAt, updatedAt FROM users WHERE id = ? AND deletedAt IS NULL', [req.user!.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) return res.status(400).json({ error: 'Invalid email format' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
