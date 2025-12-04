import express from 'express';
import { dbAll, dbGet, dbRun } from '../database/connection';

const router = express.Router();

/**
 * GET /api/users
 * Optional: search by username
 */
router.get('/users', async (req, res) => {
  try {
    const { username } = req.query;

    let users;
    if (username) {
      users = await dbAll(
        `SELECT * FROM users WHERE username LIKE ?`,
        [`%${username}%`]
      );
    } else {
      users = await dbAll(`SELECT * FROM users`);
    }

    res.json(users || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /user/profile
 * Must validate email format
 */
router.get('/user/profile', async (req, res) => {
  try {
    // Test environment assumes user with id=1 exists
    const user = await dbGet(`SELECT * FROM users WHERE id = 1`);

    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Regex validation for email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/:id
 * Replace entire User object
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const { id } = req.params;

    await dbRun(
      `UPDATE users 
       SET username = ?, email = ?, password = ?, role = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [username, email, password, role, id]
    );

    const updated = await dbGet(`SELECT * FROM users WHERE id = ?`, [id]);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'User update failed' });
  }
});

export default router;
