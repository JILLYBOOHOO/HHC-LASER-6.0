import { Pool, PoolConfig, PoolClient, QueryResult } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: env.DB_CONNECTION_LIMIT || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Supabase requires SSL; rejectUnauthorized:false avoids local CA chain issues
  ...(env.DB_SSL
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
};

export const pool = new Pool(poolConfig);

export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ PostgreSQL database connection established successfully');
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      logger.warn('⚠️ PostgreSQL database connection failed (Server running in dev mode without DB):', error);
    } else {
      logger.error('❌ PostgreSQL database connection failed:', error);
      throw error;
    }
  }
}

/** Convert MySQL '?' placeholders to Postgres '$1, $2...' */
function convertSql(sql: string): string {
  let paramIndex = 1;
  let inString = false;
  let result = '';
  for (let i = 0; i < sql.length; i++) {
    if (sql[i] === "'") {
      inString = !inString;
      result += sql[i];
    } else if (sql[i] === '?' && !inString) {
      result += `$${paramIndex++}`;
    } else {
      result += sql[i];
    }
  }
  return result;
}

/** Append RETURNING * so insertId can be read when the table has an id column */
function withReturning(sql: string): string {
  const trimmed = sql.trim().replace(/;?\s*$/, '');
  if (/^INSERT/i.test(trimmed) && !/RETURNING/i.test(trimmed)) {
    return `${trimmed} RETURNING *`;
  }
  return trimmed;
}

/** MySQL-compatible shape used across existing services */
export interface MysqlCompatResult {
  insertId: number | null;
  affectedRows: number;
  rows?: any[];
}

/**
 * Transaction client with a MySQL-like execute() API so existing
 * `const [result] = await conn.execute(...)` call sites keep working on pg.
 */
export interface TransactionClient {
  query(sql: string, params?: any[]): Promise<QueryResult>;
  execute(sql: string, params?: any[]): Promise<[MysqlCompatResult | any[]]>;
}

function wrapClient(client: PoolClient): TransactionClient {
  return {
    query(sql: string, params?: any[]) {
      return client.query(convertSql(sql), params);
    },
    async execute(sql: string, params?: any[]) {
      const trimmed = sql.trim();
      const isSelect = /^SELECT/i.test(trimmed);
      const q = convertSql(isSelect ? trimmed : withReturning(trimmed));
      const result = await client.query(q, params);

      if (isSelect) {
        return [result.rows];
      }

      return [
        {
          insertId: result.rows[0]?.id ?? null,
          affectedRows: result.rowCount ?? 0,
          rows: result.rows,
        },
      ];
    },
  };
}

export async function executeQuery<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query(convertSql(sql), params);
  return result.rows as T[];
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
): Promise<{ affectedRows: number; insertId: number | null }> {
  const result = await pool.query(convertSql(withReturning(sql)), params);

  let insertId: number | null = null;
  if (result.rows.length > 0 && result.rows[0].id != null) {
    insertId = result.rows[0].id;
  }

  return {
    affectedRows: result.rowCount ?? 0,
    insertId,
  };
}

export async function withTransaction<T>(
  callback: (client: TransactionClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  await client.query('BEGIN');
  try {
    const result = await callback(wrapClient(client));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
