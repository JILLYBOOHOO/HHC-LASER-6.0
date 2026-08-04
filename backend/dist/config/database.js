"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.executeQuery = executeQuery;
exports.executeQueryOne = executeQueryOne;
exports.executeUpdate = executeUpdate;
exports.withTransaction = withTransaction;
const pg_1 = require("pg");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const poolConfig = {
    connectionString: env_1.env.DATABASE_URL,
    max: env_1.env.DB_CONNECTION_LIMIT || 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // Supabase requires SSL; rejectUnauthorized:false avoids local CA chain issues
    ...(env_1.env.DB_SSL
        ? {
            ssl: {
                rejectUnauthorized: false,
            },
        }
        : {}),
};
exports.pool = new pg_1.Pool(poolConfig);
async function testConnection() {
    try {
        const client = await exports.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger_1.logger.info('✅ PostgreSQL database connection established successfully');
    }
    catch (error) {
        if (env_1.env.NODE_ENV === 'development') {
            logger_1.logger.warn('⚠️ PostgreSQL database connection failed (Server running in dev mode without DB):', error);
        }
        else {
            logger_1.logger.error('❌ PostgreSQL database connection failed:', error);
            throw error;
        }
    }
}
/** Convert MySQL '?' placeholders to Postgres '$1, $2...' */
function convertSql(sql) {
    let paramIndex = 1;
    let inString = false;
    let result = '';
    for (let i = 0; i < sql.length; i++) {
        if (sql[i] === "'") {
            inString = !inString;
            result += sql[i];
        }
        else if (sql[i] === '?' && !inString) {
            result += `$${paramIndex++}`;
        }
        else {
            result += sql[i];
        }
    }
    return result;
}
/** Append RETURNING * so insertId can be read when the table has an id column */
function withReturning(sql) {
    const trimmed = sql.trim().replace(/;?\s*$/, '');
    if (/^INSERT/i.test(trimmed) && !/RETURNING/i.test(trimmed)) {
        return `${trimmed} RETURNING *`;
    }
    return trimmed;
}
function wrapClient(client) {
    return {
        query(sql, params) {
            return client.query(convertSql(sql), params);
        },
        async execute(sql, params) {
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
async function executeQuery(sql, params) {
    const result = await exports.pool.query(convertSql(sql), params);
    return result.rows;
}
async function executeQueryOne(sql, params) {
    const rows = await executeQuery(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
async function executeUpdate(sql, params) {
    const result = await exports.pool.query(convertSql(withReturning(sql)), params);
    let insertId = null;
    if (result.rows.length > 0 && result.rows[0].id != null) {
        insertId = result.rows[0].id;
    }
    return {
        affectedRows: result.rowCount ?? 0,
        insertId,
    };
}
async function withTransaction(callback) {
    const client = await exports.pool.connect();
    await client.query('BEGIN');
    try {
        const result = await callback(wrapClient(client));
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
exports.default = exports.pool;
//# sourceMappingURL=database.js.map