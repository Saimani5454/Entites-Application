import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const DB_PATH = path.join(__dirname, '../data/app.db');

// Typed database reference
export let db: Database<sqlite3.Database, sqlite3.Statement>;

/**
 * Initialize SQLite database and tables
 */
export const initializeDatabase = async (): Promise<void> => {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME
    )
  `);

  // Companies table
  await db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT,
      employees INTEGER,
      revenue INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME
    )
  `);

  // Clients table
  await db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      userId INTEGER NOT NULL,
      companyId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(companyId) REFERENCES companies(id)
    )
  `);
};

/**
 * Typed query helpers
 */
export const dbAll = async <T = any>(query: string, params: any[] = []): Promise<T[]> => {
  if (!db) throw new Error('Database not initialized');
  return db.all<T[]>(query, params);
};

export const dbGet = async <T = any>(query: string, params: any[] = []): Promise<T | undefined> => {
  if (!db) throw new Error('Database not initialized');
  return db.get<T>(query, params);
};

export const dbRun = async (query: string, params: any[] = []): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.run(query, params);
};
