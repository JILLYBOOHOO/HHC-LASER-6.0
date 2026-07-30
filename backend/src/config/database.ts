// @ts-ignore
import Database from 'better-sqlite3';
import { logger } from '../utils/logger';

const db = new Database('database.sqlite');

export interface MockPool {
  query: <T = any>(sql: string, params?: any[]) => Promise<any>;
  execute: <T = any>(sql: string, params?: any[]) => Promise<any>;
  getConnection: () => Promise<any>;
}

const runQuery = async (sql: string, params: any[] = []) => {
  sql = sql.replace(/NOW\(\)/g, "DATETIME('now')");
  sql = sql.replace(/COALESCE/gi, 'COALESCE');
  sql = sql.replace(/ON DUPLICATE KEY UPDATE/gi, 'ON CONFLICT DO UPDATE SET');
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    const stmt = db.prepare(sql);
    return [stmt.all(...params)];
  } else {
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);
    return [{ affectedRows: info.changes, insertId: info.lastInsertRowid }];
  }
};

export const pool: MockPool = {
  query: runQuery,
  execute: runQuery,
  getConnection: async () => ({
    ping: async () => {},
    release: () => {},
    beginTransaction: async () => { db.prepare('BEGIN').run(); },
    commit: async () => { db.prepare('COMMIT').run(); },
    rollback: async () => { db.prepare('ROLLBACK').run(); },
    execute: runQuery,
    query: runQuery,
  })
};

export async function testConnection(): Promise<void> {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        date_of_birth TEXT,
        profile_photo_url TEXT,
        google_id TEXT,
        authentication_method TEXT,
        last_login DATETIME,
        token_version INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        email_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS business_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT
      );
      
      CREATE TABLE IF NOT EXISTS error_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        error_type TEXT,
        message TEXT,
        stack_trace TEXT,
        user_id INTEGER,
        endpoint TEXT,
        method TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS service_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        icon_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        short_description TEXT,
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        price_jmd REAL NOT NULL,
        price_usd REAL DEFAULT NULL,
        deposit_required INTEGER NOT NULL DEFAULT 0,
        deposit_amount_jmd REAL DEFAULT NULL,
        requires_consultation INTEGER NOT NULL DEFAULT 0,
        preparation_notes TEXT DEFAULT NULL,
        aftercare_notes TEXT DEFAULT NULL,
        thumbnail_url TEXT DEFAULT NULL,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES service_categories(id)
      );
    `);
    logger.info('✅ SQLite database connection established successfully');
  } catch (error) {
    logger.error('❌ SQLite database connection failed:', error);
    throw error;
  }
}

export async function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await runQuery(sql, params);
  return rows as T[];
}

export async function executeQueryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await executeQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function executeUpdate(
  sql: string,
  params: any[] = []
): Promise<{ affectedRows: number; insertId: number }> {
  const [info] = await runQuery(sql, params) as any;
  return {
    affectedRows: info.affectedRows,
    insertId: info.insertId,
  };
}

export async function withTransaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  let result: T;
  db.prepare('BEGIN').run();
  try {
    const mockConn = {
      execute: runQuery,
      query: runQuery
    };
    result = await callback(mockConn);
    db.prepare('COMMIT').run();
    return result;
  } catch (error) {
    db.prepare('ROLLBACK').run();
    throw error;
  }
}

export default pool;
