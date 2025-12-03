import request from 'supertest';
import express from 'express';
import { dbRun, initializeDatabase, db } from '../src/database/connection';
import userRoutes from '../src/routes/userRoutes';
import clientRoutes from '../src/routes/clientRoutes';

const app = express();
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', clientRoutes);

// Setup test database
beforeAll(async () => {
  try {
    await dbRun('DROP TABLE IF EXISTS client_users');
    await dbRun('DROP TABLE IF EXISTS company_users');
    await dbRun('DROP TABLE IF EXISTS clients');
    await dbRun('DROP TABLE IF EXISTS companies');
    await dbRun('DROP TABLE IF EXISTS users');
  } catch (e) {}

  await initializeDatabase();

  // Insert test data
  await dbRun(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    ['admin', 'admin@example.com', 'admin123', 'ROLE_ADMIN']
  );
  await dbRun(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    ['user1', 'user1@example.com', 'user123', 'ROLE_USER']
  );
  await dbRun(
    'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
    ['TestCorp', 'Technology', 5000, 1000000000]
  );
  await dbRun(
    'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
    ['TestCorp2', 'Finance', 3000, 500000000]
  );
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
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].username).toContain('admin');
    });

    test('PUT /api/users/:id should replace entire user object', async () => {
      // First get a user
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
        .send({
          username: 'partial_update'
          // missing other required fields
        });

      expect(updateResponse.status).toBe(400);
    });

    test('GET /user/profile should require authentication', async () => {
      const response = await request(app).get('/user/profile');
      expect(response.status).toBe(401);
    });

    test('GET /user/profile should validate email format', async () => {
      const response = await request(app)
        .get('/user/profile')
        .set('x-user', JSON.stringify({
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN'
        }));

      expect(response.status).toBe(200);
      expect(response.body.email).toMatch(/@/);
    });
  });

  describe('Client Endpoints', () => {

    test('POST /api/clients should require ROLE_ADMIN', async () => {
      // First, get company and user IDs
      const response = await request(app).get('/api/users?username=user1');
      const userId = response.body[0].id;

      // Try to create client as ROLE_USER
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
      expect(createResponse.body.client.email).toBe('newclient@example.com');
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
      expect(createResponse.body.error).toContain('Invalid email');
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
      expect(createResponse.body.error).toContain('numbers');
    });

    test('POST /api/clients should prevent duplicate company assignment', async () => {
      const adminResponse = await request(app).get('/api/users?username=admin');
      const adminId = adminResponse.body[0].id;

      // First client creation (succeeds)
      const firstCreate = await request(app)
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

      expect(firstCreate.status).toBe(201);

      // Second client creation with same company (should fail)
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

    test('PATCH /api/clients/:id should update client fields', async () => {
      // Get a client
      const clientsResponse = await request(app).get('/api/clients');
      if (clientsResponse.body.length > 0) {
        const clientId = clientsResponse.body[0].id;

        const updateResponse = await request(app)
          .patch(`/api/clients/${clientId}`)
          .send({
            name: 'UpdatedClientName',
            email: 'updated@example.com'
          });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.client.name).toBe('UpdatedClientName');
        expect(updateResponse.body.client.email).toBe('updated@example.com');
      }
    });

    test('GET /api/clients should list all clients', async () => {
      const response = await request(app).get('/api/clients');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/clients/:id should get a specific client', async () => {
      const listResponse = await request(app).get('/api/clients');
      if (listResponse.body.length > 0) {
        const clientId = listResponse.body[0].id;

        const getResponse = await request(app).get(`/api/clients/${clientId}`);
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.id).toBe(clientId);
      }
    });
  });

  describe('Error Handling', () => {

    test('should return 404 for non-existent user', async () => {
      const response = await request(app).put('/api/users/99999').send({
        username: 'test',
        email: 'test@example.com',
        password: 'test',
        role: 'ROLE_USER'
      });

      expect(response.status).toBe(404);
    });

    test('should return 404 for non-existent client', async () => {
      const response = await request(app).get('/api/clients/99999');
      expect(response.status).toBe(404);
    });
  });

});
