import { Router } from 'express';
import { dbAll, dbGet, dbRun } from '../database/connection';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/users
 * Optional query: ?username=
 */
router.get('/users', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/user/profile
 * Requires authentication
 */
router.get('/user/profile', requireAuth, async (req, res) => {
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
});

/**
 * PUT /api/users/:id
 * Replace entire user
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) return res.status(400).json({ error: 'Missing required fields' });
    if (!['ROLE_USER', 'ROLE_ADMIN'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const existingUser = await dbGet('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [id]);
    if (!existingUser) return res.status(404).json({ error: 'User not found' });

    // Check for duplicates
    const userWithUsername = await dbGet('SELECT id FROM users WHERE username = ? AND id != ? AND deletedAt IS NULL', [username, id]);
    if (userWithUsername) return res.status(409).json({ error: 'Username already exists' });

    const userWithEmail = await dbGet('SELECT id FROM users WHERE email = ? AND id != ? AND deletedAt IS NULL', [email, id]);
    if (userWithEmail) return res.status(409).json({ error: 'Email already exists' });

    await dbRun('UPDATE users SET username = ?, email = ?, password = ?, role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [username, email, password, role, id]);
    const updatedUser = await dbGet('SELECT id, username, email, role, createdAt, updatedAt FROM users WHERE id = ?', [id]);

    res.json({ message: 'User replaced successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to replace user' });
  }
});

export default router;
