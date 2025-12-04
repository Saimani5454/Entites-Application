import request from 'supertest';
import express from 'express';
import { dbRun, dbGet, initializeDatabase, db } from '../src/database/connection';
import userRoutes from '../src/routes/userRoutes';
import clientRoutes from '../src/routes/clientRoutes';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Company {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
  userId: number;
  companyId: number;
}

const app = express();
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', clientRoutes);

beforeAll(async () => {
  await initializeDatabase();

  // Insert test companies
  await dbRun('INSERT INTO companies (name) VALUES (?)', ['TestCorp']);
  await dbRun('INSERT INTO companies (name) VALUES (?)', ['TestCorp2']);

  // Insert admin user
  await dbRun(
    'INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    ['admin', 'admin@example.com', 'pass123', 'ROLE_ADMIN']
  );

  // Insert regular user
  await dbRun(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    ['user1', 'user1@example.com', 'pass123', 'ROLE_USER']
  );
});

afterAll(() => db.close());

describe('API Functional Tests', () => {
  test('GET /api/users should list users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/clients as ROLE_USER should fail', async () => {
    const user = await dbGet<User>('SELECT * FROM users WHERE role = ?', ['ROLE_USER']);
    const res = await request(app)
      .post('/api/clients')
      .set('x-user', JSON.stringify(user))
      .send({ name: 'Client1', email: 'client1@example.com', phone: '1234567890', userId: user!.id, companyId: 1 });

    expect(res.status).toBe(403);
  });

  test('POST /api/clients as ROLE_ADMIN should succeed', async () => {
    const admin = await dbGet<User>('SELECT * FROM users WHERE role = ?', ['ROLE_ADMIN']);
    const res = await request(app)
      .post('/api/clients')
      .set('x-user', JSON.stringify(admin))
      .send({ name: 'ClientAdmin', email: 'adminclient@example.com', phone: '9876543210', userId: admin!.id, companyId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.client.name).toBe('ClientAdmin');
  });

  test('POST /api/clients duplicate company assignment should fail', async () => {
    const admin = await dbGet<User>('SELECT * FROM users WHERE role = ?', ['ROLE_ADMIN']);
    const res = await request(app)
      .post('/api/clients')
      .set('x-user', JSON.stringify(admin))
      .send({ name: 'DuplicateClient', email: 'dup@example.com', phone: '1234567890', userId: admin!.id, companyId: 1 });

    expect(res.status).toBe(409);
  });
});
