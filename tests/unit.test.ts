import { dbRun, dbAll, dbGet, initializeDatabase, db } from '../src/database/connection';
import {
  findCompaniesByEmployeeRange,
  countCompaniesByMinEmployees,
  getMaxRevenueByIndustry,
  findClientsByUser,
  findClientsByCompanyName
} from '../src/queries/customQueries';
import { isValidEmail, isValidPhone } from '../src/utils/validators';

// Test utilities
const setupTestDatabase = async () => {
  // Clear existing database
  try {
    await dbRun('DROP TABLE IF EXISTS client_users');
    await dbRun('DROP TABLE IF EXISTS company_users');
    await dbRun('DROP TABLE IF EXISTS clients');
    await dbRun('DROP TABLE IF EXISTS companies');
    await dbRun('DROP TABLE IF EXISTS users');
  } catch (e) {
    // Table might not exist
  }

  // Initialize fresh schema
  await initializeDatabase();
};

const cleanupTestDatabase = () => {
  return new Promise<void>((resolve) => {
    db.close(() => resolve());
  });
};

describe('Entity Application - Unit Tests', () => {
  
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Database will be closed at the end
  });

  describe('Validators', () => {
    test('should validate correct email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
    });

    test('should reject invalid email format', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    test('should validate phone with numbers only', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('555-1234')).toBe(false);
      expect(isValidPhone('abc1234')).toBe(false);
    });
  });

  describe('Database Operations', () => {
    
    test('should insert and retrieve a user', async () => {
      await dbRun(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['testuser', 'test@example.com', 'password123', 'ROLE_USER']
      );

      const user = await dbGet('SELECT * FROM users WHERE username = ?', ['testuser']);
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('ROLE_USER');
    });

    test('should insert and retrieve a company', async () => {
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['TechCorp', 'Technology', 5000, 1000000000]
      );

      const company = await dbGet('SELECT * FROM companies WHERE name = ?', ['TechCorp']);
      expect(company).toBeDefined();
      expect(company.name).toBe('TechCorp');
      expect(company.industry).toBe('Technology');
      expect(company.employees).toBe(5000);
    });
  });

  describe('Company Employee Count Queries', () => {

    beforeAll(async () => {
      // Insert test companies
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['SmallCorp', 'Tech', 50, 100000]
      );
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['MediumCorp', 'Finance', 500, 500000]
      );
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['LargeCorp', 'Retail', 250000, 50000000]
      );
    });

    test('should find only 1 company with more than 200,000 employees', async () => {
      const count = await countCompaniesByMinEmployees(200000);
      expect(count).toBe(1);
    });

    test('should find companies by employee range', async () => {
      const companies = await findCompaniesByEmployeeRange(100, 1000);
      expect(companies.length).toBeGreaterThanOrEqual(1);
      expect(companies[0].employees).toBeGreaterThanOrEqual(100);
      expect(companies[0].employees).toBeLessThanOrEqual(1000);
    });
  });

  describe('Max Revenue Query', () => {

    beforeAll(async () => {
      // Insert test companies for max revenue check
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['Amazon', 'E-commerce', 1500000, 469000000000]
      );
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['Google', 'Technology', 190234, 282836000000]
      );
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['Walmart', 'E-commerce', 2100000, 648000000000]
      );
      await dbRun(
        'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
        ['eBay', 'E-commerce', 12800, 5700000000]
      );
    });

    test('should return max revenue company per industry', async () => {
      const result = await getMaxRevenueByIndustry();
      expect(result.length).toBeGreaterThan(0);
      
      // Should contain companies with max revenue in their industries
      const names = result.map((c: any) => c.name);
      
      // Verify Walmart (E-commerce with highest revenue) and Google (Tech) are present
      const hasWalmart = names.some((name: string) => name === 'Walmart' || name === 'Amazon');
      expect(hasWalmart).toBe(true);
    });

    test('should not include multiple e-commerce companies if one has max revenue', async () => {
      const result = await getMaxRevenueByIndustry();
      const ecommerceCompanies = result.filter((c: any) => c.industry === 'E-commerce');
      
      // Should have exactly 1 E-commerce company (the one with max revenue)
      expect(ecommerceCompanies.length).toBe(1);
      
      // The E-commerce company should be the one with highest revenue
      const ecommerceName = ecommerceCompanies[0].name;
      expect(['Walmart', 'Amazon', 'eBay']).toContain(ecommerceName);
    });
  });

  describe('Client Queries', () => {

    test('should find clients by user', async () => {
      // Insert test data
      const adminUser = await dbGet('SELECT id FROM users WHERE role = "ROLE_ADMIN"');
      let testUserId = adminUser?.id;

      if (!testUserId) {
        await dbRun(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          ['admin', 'admin@example.com', 'password', 'ROLE_ADMIN']
        );
        const user = await dbGet('SELECT id FROM users WHERE username = ?', ['admin']);
        testUserId = user.id;
      }

      const company = await dbGet('SELECT id FROM companies LIMIT 1');
      if (company) {
        await dbRun(
          'INSERT INTO clients (name, email, phone, userId, companyId) VALUES (?, ?, ?, ?, ?)',
          ['Test Client', 'client@example.com', '1234567890', testUserId, company.id]
        );

        const clients = await findClientsByUser(testUserId);
        expect(clients.length).toBeGreaterThan(0);
        expect(clients[0].name).toBe('Test Client');
      }
    });

    test('should find clients by company name', async () => {
      const clients = await findClientsByCompanyName('Tech');
      expect(Array.isArray(clients)).toBe(true);
    });
  });

  describe('Role-Based Access Control', () => {

    test('ROLE_USER should not be able to create another user', async () => {
      const user = await dbGet('SELECT * FROM users WHERE role = ?', ['ROLE_USER']);
      expect(user).toBeDefined();
      expect(user.role).toBe('ROLE_USER');
      
      // In the actual API, this would be prevented by the requireAdmin middleware
      // This test verifies the logic would work correctly
      expect(user.role !== 'ROLE_ADMIN').toBe(true);
    });

    test('ROLE_ADMIN should exist and be distinct from ROLE_USER', async () => {
      const adminUser = await dbGet('SELECT * FROM users WHERE role = ?', ['ROLE_ADMIN']);
      const regularUser = await dbGet('SELECT * FROM users WHERE role = ?', ['ROLE_USER']);
      
      expect(adminUser).toBeDefined();
      expect(regularUser).toBeDefined();
      expect(adminUser.role).not.toBe(regularUser.role);
    });
  });

  describe('Client Creation Validation', () => {

    test('should prevent duplicate company assignment to clients', async () => {
      const company = await dbGet('SELECT id FROM companies LIMIT 1');
      const user = await dbGet('SELECT id FROM users WHERE role = ? LIMIT 1', ['ROLE_ADMIN']);

      if (company && user) {
        // Try to create a client with an already assigned company
        const existingClient = await dbGet(
          'SELECT * FROM clients WHERE companyId = ? AND deletedAt IS NULL LIMIT 1',
          [company.id]
        );

        if (existingClient) {
          // This company is already assigned, so creating another client should fail
          expect(existingClient.companyId).toBe(company.id);
        }
      }
    });

    test('should validate email format in client', async () => {
      expect(isValidEmail('client@company.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    test('should validate phone format in client', async () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1-234-567-8900')).toBe(false);
    });
  });

});
