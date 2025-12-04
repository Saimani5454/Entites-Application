// src/database/connection.ts
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default DB path
const DB_PATH = path.join(DATA_DIR, 'app.db');

export let db: sqlite3.Database;

/**
 * Initialize SQLite database with required tables
 */
export const initializeDatabase = async (dbPath: string = DB_PATH): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to open database:', err);
        return reject(err);
      }

      // Create tables
      db.serialize(() => {
        db.run(`
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

        db.run(`
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

        db.run(`
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

        resolve();
      });
    });
  });
};

/**
 * Promisified query helpers
 */
export const dbAll = <T = any>(query: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
};

export const dbGet = <T = any>(query: string, params: any[] = []): Promise<T> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T);
    });
  });
};

export const dbRun = (query: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

/**
 * Close the database
 */
export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
