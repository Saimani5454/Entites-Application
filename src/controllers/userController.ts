import { Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../database/connection';

/**
 * List all users with optional username filter
 * GET /api/users
 * Query params: ?username=search_term
 */
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.query;
    let query = 'SELECT id, username, email, role, createdAt FROM users WHERE deletedAt IS NULL';
    const params: any[] = [];

    if (username) {
      query += ' AND username LIKE ?';
      params.push(`%${username}%`);
    }

    query += ' ORDER BY createdAt DESC';

    const users = await dbAll(query, params);
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

/**
 * Replace entire user object (PUT)
 * PUT /api/users/:id
 */
export const replaceUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      res.status(400).json({ error: 'Missing required fields: username, email, password, role' });
      return;
    }

    // Validate role
    if (!['ROLE_USER', 'ROLE_ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be ROLE_USER or ROLE_ADMIN' });
      return;
    }

    // Check if user exists
    const existingUser = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [id]);
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if username already exists (for another user)
    const userWithUsername = await dbGet(
      'SELECT id FROM users WHERE username = ? AND id != ? AND deletedAt IS NULL',
      [username, id]
    );
    if (userWithUsername) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    // Check if email already exists (for another user)
    const userWithEmail = await dbGet(
      'SELECT id FROM users WHERE email = ? AND id != ? AND deletedAt IS NULL',
      [email, id]
    );
    if (userWithEmail) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    // Update user (replace all fields)
    await dbRun(
      'UPDATE users SET username = ?, email = ?, password = ?, role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [username, email, password, role, id]
    );

    const updatedUser = await dbGet(
      'SELECT id, username, email, role, createdAt, updatedAt FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User replaced successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error replacing user:', error);
    res.status(500).json({ error: 'Failed to replace user' });
  }
};

/**
 * Get user profile with email validation
 * GET /user/profile
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await dbGet(
      'SELECT id, username, email, role, createdAt, updatedAt FROM users WHERE id = ? AND deletedAt IS NULL',
      [req.user.id]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Email validation happens at this endpoint
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      res.status(400).json({ error: 'User email is invalid' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};
