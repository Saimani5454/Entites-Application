/**
 * Database Seeding Script
 * Populates the database with test data
 * 
 * Usage: node dist/scripts/seed.js
 */

import { dbRun, db, initializeDatabase } from '../database/connection';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize schema first
    await initializeDatabase();

    // Insert test users
    console.log('📝 Inserting test users...');
    await dbRun(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@example.com', 'admin_password_123', 'ROLE_ADMIN']
    );
    await dbRun(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['john_doe', 'john@example.com', 'user_password_123', 'ROLE_USER']
    );
    await dbRun(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['jane_smith', 'jane@example.com', 'user_password_123', 'ROLE_USER']
    );

    // Insert test companies
    console.log('🏢 Inserting test companies...');
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
      ['Microsoft', 'Technology', 221000, 198000000000]
    );
    await dbRun(
      'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
      ['Walmart', 'Retail', 2100000, 648000000000]
    );
    await dbRun(
      'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
      ['Goldman Sachs', 'Finance', 40000, 59000000000]
    );
    await dbRun(
      'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
      ['JPMorgan Chase', 'Finance', 316000, 161000000000]
    );
    await dbRun(
      'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
      ['Apple', 'Technology', 164000, 394000000000]
    );
    await dbRun(
      'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
      ['eBay', 'E-commerce', 12800, 5700000000]
    );
    await dbRun(
      'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
      ['Facebook', 'Technology', 86482, 114000000000]
    );
    await dbRun(
      'INSERT INTO companies (name, industry, employees, revenue) VALUES (?, ?, ?, ?)',
      ['Netflix', 'Entertainment', 11800, 31600000000]
    );

    // Insert test clients
    console.log('👥 Inserting test clients...');
    await dbRun(
      'INSERT INTO clients (name, email, phone, userId, companyId) VALUES (?, ?, ?, ?, ?)',
      ['Acme Corporation', 'contact@acmecorp.com', '5551234567', 1, 1]
    );
    await dbRun(
      'INSERT INTO clients (name, email, phone, userId, companyId) VALUES (?, ?, ?, ?, ?)',
      ['TechStart Inc', 'hello@techstart.com', '5559876543', 1, 2]
    );
    await dbRun(
      'INSERT INTO clients (name, email, phone, userId, companyId) VALUES (?, ?, ?, ?, ?)',
      ['Global Solutions Ltd', 'info@globalsolutions.com', '1234567890', 2, 3]
    );
    await dbRun(
      'INSERT INTO clients (name, email, phone, userId, companyId) VALUES (?, ?, ?, ?, ?)',
      ['Enterprise Partners', 'support@enterprise.com', '9876543210', 2, 4]
    );
    await dbRun(
      'INSERT INTO clients (name, email, phone, userId, companyId) VALUES (?, ?, ?, ?, ?)',
      ['Innovation Labs', 'hello@innovationlabs.com', '5555555555', 3, 5]
    );

    // Insert client-user relationships
    console.log('🔗 Inserting client-user relationships...');
    await dbRun(
      'INSERT INTO client_users (clientId, userId, active) VALUES (?, ?, ?)',
      [1, 1, 1]
    );
    await dbRun(
      'INSERT INTO client_users (clientId, userId, active) VALUES (?, ?, ?)',
      [1, 2, 1]
    );
    await dbRun(
      'INSERT INTO client_users (clientId, userId, active) VALUES (?, ?, ?)',
      [2, 1, 1]
    );
    await dbRun(
      'INSERT INTO client_users (clientId, userId, active) VALUES (?, ?, ?)',
      [3, 2, 1]
    );
    await dbRun(
      'INSERT INTO client_users (clientId, userId, active) VALUES (?, ?, ?)',
      [4, 2, 1]
    );
    await dbRun(
      'INSERT INTO client_users (clientId, userId, active) VALUES (?, ?, ?)',
      [5, 3, 1]
    );

    // Insert company-user relationships
    console.log('🌐 Inserting company-user relationships...');
    await dbRun(
      'INSERT INTO company_users (companyId, userId) VALUES (?, ?)',
      [1, 1]
    );
    await dbRun(
      'INSERT INTO company_users (companyId, userId) VALUES (?, ?)',
      [2, 1]
    );
    await dbRun(
      'INSERT INTO company_users (companyId, userId) VALUES (?, ?)',
      [3, 2]
    );
    await dbRun(
      'INSERT INTO company_users (companyId, userId) VALUES (?, ?)',
      [4, 2]
    );
    await dbRun(
      'INSERT INTO company_users (companyId, userId) VALUES (?, ?)',
      [5, 3]
    );
    await dbRun(
      'INSERT INTO company_users (companyId, userId) VALUES (?, ?)',
      [6, 1]
    );
    await dbRun(
      'INSERT INTO company_users (companyId, userId) VALUES (?, ?)',
      [7, 2]
    );

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log('   - 3 users (1 admin, 2 regular)');
    console.log('   - 10 companies across different industries');
    console.log('   - 5 clients linked to users and companies');
    console.log('   - Multiple user-client and company-user relationships');

    // Close database connection
    db.close();
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
