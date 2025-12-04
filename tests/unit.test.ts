import { dbRun, dbGet, dbAll, initializeDatabase, db } from '../src/database/connection';
import { isValidEmail, isValidPhone } from '../src/utils/validators';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Company {
  id: number;
  name: string;
  industry?: string;
  employees?: number;
  revenue?: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  userId: number;
  companyId: number;
}

const setupTestDatabase = async () => {
  await dbRun('DROP TABLE IF EXISTS clients');
  await dbRun('DROP TABLE IF EXISTS companies');
  await dbRun('DROP TABLE IF EXISTS users');

  await initializeDatabase();
};

describe('Entity Application - Unit Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(() => db.close());

  describe('Validators', () => {
    test('valid email passes', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    test('invalid email fails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    test('valid phone numbers pass', () => {
      expect(isValidPhone('1234567890')).toBe(true);
    });

    test('invalid phone numbers fail', () => {
      expect(isValidPhone('123-abc')).toBe(false);
    });
  });

  describe('Database CRUD', () => {
    test('insert and retrieve a user', async () => {
      await dbRun(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['testuser', 'test@example.com', 'pass123', 'ROLE_USER']
      );

      const user = await dbGet<User>('SELECT * FROM users WHERE username = ?', ['testuser']);
      expect(user).toBeDefined();
      expect(user!.role).toBe('ROLE_USER');
    });

    test('insert and retrieve a company', async () => {
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['TechCorp', 'Technology', 500, 1000000]
      );

      const company = await dbGet<Company>('SELECT * FROM companies WHERE name = ?', ['TechCorp']);
      expect(company).toBeDefined();
      expect(company!.name).toBe('TechCorp');
    });

    test('insert and retrieve a client', async () => {
      const user = await dbGet<User>('SELECT * FROM users LIMIT 1');
      const company = await dbGet<Company>('SELECT * FROM companies LIMIT 1');

      await dbRun(
        'INSERT INTO clients (name, email, phone, userId, companyId) VALUES (?, ?, ?, ?, ?)',
        ['Client1', 'client1@example.com', '1234567890', user!.id, company!.id]
      );

      const client = await dbGet<Client>('SELECT * FROM clients WHERE name = ?', ['Client1']);
      expect(client).toBeDefined();
      expect(client!.userId).toBe(user!.id);
      expect(client!.companyId).toBe(company!.id);
    });
  });
});
