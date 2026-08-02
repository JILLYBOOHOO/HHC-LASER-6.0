import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import { env } from './env';
import { logger } from '../utils/logger';

const poolConfig: PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  ...(env.DB_SSL ? {
    ssl: {
      rejectUnauthorized: true,
    }
  } : {}),
};

export const pool: Pool = mysql.createPool(poolConfig);

export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('✅ MySQL database connection established successfully');
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      logger.warn('⚠️ MySQL database connection failed (Server running in dev mode without DB):', error);
    } else {
      logger.error('❌ MySQL database connection failed:', error);
      throw error;
    }
  }
}

export async function executeQuery<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function executeQueryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await executeQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function executeUpdate(
  sql: string,
  params?: any[]
): Promise<{ affectedRows: number; insertId: number }> {
  const [result] = await pool.execute(sql, params) as any;
  return {
    affectedRows: result.affectedRows,
    insertId: result.insertId,
  };
}

export async function withTransaction<T>(
  callback: (connection: mysql.Connection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
