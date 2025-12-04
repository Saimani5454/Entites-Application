import request from 'supertest';
import express from 'express';
import { dbRun, initializeDatabase, db } from '../src/database/connection';
import userRoutes from '../src/routes/userRoutes';
import clientRoutes from '../src/routes/clientRoutes';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', clientRoutes);

// Test database path
const TEST_DB_PATH = path.join(__dirname, '../data/test.db');

const resetTestDatabase = async (): Promise<void> => {
  // Delete test DB file completely
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
  
  // Drop any WAL/SHM files
  const walFiles = [TEST_DB_PATH + '-wal', TEST_DB_PATH + '-shm'];
  walFiles.forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
  
  // Reinitialize clean database
  await initializeDatabase();
};

beforeAll(async () => {
  // Use test database exclusively
  await resetTestDatabase();
  
  // Insert consistent test data
  await dbRun(
    'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
    ['TestCorp', 'Technology', 5000, 1000000000]
  );
  await dbRun(
    'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
    ['TestCorp2', 'Finance', 3000, 500000000]
  );
  
  // Insert users (initializeDatabase admin already exists)
  await dbRun(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    ['user1', 'user1@example.com', 'user123', 'ROLE_USER']
  );
});

beforeEach(async () => {
  // Reset relevant data between tests to avoid state leakage
  await dbRun('DELETE FROM client_users');
  await dbRun('DELETE FROM company_users');
  await dbRun('DELETE FROM clients');
});

afterAll(() => {
  return new Promise<void>((resolve) => {
    db.close(() => resolve());
  });
});

describe('API Functional Tests', () => {
  describe('User Endpoints', () => {
    test('GET /api/users should list all users', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/users?username=admin should filter users by username', async () => {
      const response = await request(app).get('/api/users?username=admin');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]?.username).toContain('admin');
    });

    test('PUT /api/users/:id should replace entire user object', async () => {
      const getResponse = await request(app).get('/api/users');
      const userId = getResponse.body[0].id;

      const updateResponse = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          username: 'updated_user',
          email: 'updated@example.com',
          password: 'newpassword123',
          role: 'ROLE_USER'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.user.username).toBe('updated_user');
      expect(updateResponse.body.user.email).toBe('updated@example.com');
    });

    test('PUT /api/users/:id should fail with missing fields', async () => {
      const getResponse = await request(app).get('/api/users');
      const userId = getResponse.body[0].id;

      const updateResponse = await request(app)
        .put(`/api/users/${userId}`)
        .send({ username: 'partial_update' });

      expect(updateResponse.status).toBe(400);
    });

    test('GET /user/profile should require authentication', async () => {
      const response = await request(app).get('/user/profile');
      expect(response.status).toBe(401);
    });
  });

  describe('Client Endpoints', () => {
    test('POST /api/clients should require ROLE_ADMIN', async () => {
      const userResponse = await request(app).get('/api/users?username=user1');
      const userId = userResponse.body[0].id;

      const createResponse = await request(app)
        .post('/api/clients')
        .set('x-user', JSON.stringify({
          id: userId,
          username: 'user1',
          email: 'user1@example.com',
          role: 'ROLE_USER'
        }))
        .send({
          name: 'TestClient',
          email: 'client@example.com',
          phone: '1234567890',
          userId: userId,
          companyId: 1
        });

      expect(createResponse.status).toBe(403);
    });

    test('POST /api/clients should create client as ROLE_ADMIN', async () => {
      const adminResponse = await request(app).get('/api/users?username=admin');
      const adminId = adminResponse.body[0].id;

      const createResponse = await request(app)
        .post('/api/clients')
        .set('x-user', JSON.stringify({
          id: adminId,
          username: 'admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN'
        }))
        .send({
          name: 'NewTestClient',
          email: 'newclient@example.com',
          phone: '9876543210',
          userId: adminId,
          companyId: 1
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.client.name).toBe('NewTestClient');
    });

    test('POST /api/clients should validate email format', async () => {
      const adminResponse = await request(app).get('/api/users?username=admin');
      const adminId = adminResponse.body[0].id;

      const createResponse = await request(app)
        .post('/api/clients')
        .set('x-user', JSON.stringify({
          id: adminId,
          username: 'admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN'
        }))
        .send({
          name: 'InvalidEmailClient',
          email: 'invalid-email',
          phone: '1234567890',
          userId: adminId,
          companyId: 2
        });

      expect(createResponse.status).toBe(400);
    });

    test('POST /api/clients should validate phone format (numbers only)', async () => {
      const adminResponse = await request(app).get('/api/users?username=admin');
      const adminId = adminResponse.body[0].id;

      const createResponse = await request(app)
        .post('/api/clients')
        .set('x-user', JSON.stringify({
          id: adminId,
          username: 'admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN'
        }))
        .send({
          name: 'InvalidPhoneClient',
          email: 'client@example.com',
          phone: '123-456-7890',
          userId: adminId,
          companyId: 2
        });

      expect(createResponse.status).toBe(400);
    });

    test('POST /api/clients should prevent duplicate company assignment', async () => {
      const adminResponse = await request(app).get('/api/users?username=admin');
      const adminId = adminResponse.body[0].id;

      // First client (succeeds)
      await request(app)
        .post('/api/clients')
        .set('x-user', JSON.stringify({
          id: adminId,
          username: 'admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN'
        }))
        .send({
          name: 'Client1',
          email: 'client1@example.com',
          phone: '1111111111',
          userId: adminId,
          companyId: 2
        });

      // Second client with same company (fails)
      const secondCreate = await request(app)
        .post('/api/clients')
        .set('x-user', JSON.stringify({
          id: adminId,
          username: 'admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN'
        }))
        .send({
          name: 'Client2',
          email: 'client2@example.com',
          phone: '2222222222',
          userId: adminId,
          companyId: 2
        });

      expect(secondCreate.status).toBe(409);
    });

    test('GET /api/clients should list all clients', async () => {
      const response = await request(app).get('/api/clients');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('PATCH /api/clients/:id should update client fields', async () => {
      // Create a client first
      const adminResponse = await request(app).get('/api/users?username=admin');
      const adminId = adminResponse.body[0].id;
      
      const createResponse = await request(app)
        .post('/api/clients')
        .set('x-user', JSON.stringify({
          id: adminId,
          username: 'admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN'
        }))
        .send({
          name: 'TestClientToUpdate',
          email: 'test@example.com',
          phone
