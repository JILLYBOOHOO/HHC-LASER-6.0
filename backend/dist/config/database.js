"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.executeQuery = executeQuery;
exports.executeQueryOne = executeQueryOne;
exports.executeUpdate = executeUpdate;
exports.withTransaction = withTransaction;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const poolConfig = {
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    database: env_1.env.DB_NAME,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: env_1.env.DB_CONNECTION_LIMIT,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
    ...(env_1.env.DB_SSL ? {
        ssl: {
            rejectUnauthorized: true,
        }
    } : {}),
};
exports.pool = promise_1.default.createPool(poolConfig);
async function testConnection() {
    try {
        const connection = await exports.pool.getConnection();
        await connection.ping();
        connection.release();
        logger_1.logger.info('✅ MySQL database connection established successfully');
    }
    catch (error) {
        if (env_1.env.NODE_ENV === 'development') {
            logger_1.logger.warn('⚠️ MySQL database connection failed (Server running in dev mode without DB):', error);
        }
        else {
            logger_1.logger.error('❌ MySQL database connection failed:', error);
            throw error;
        }
    }
}
async function executeQuery(sql, params) {
    const [rows] = await exports.pool.execute(sql, params);
    return rows;
}
async function executeQueryOne(sql, params) {
    const rows = await executeQuery(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
async function executeUpdate(sql, params) {
    const [result] = await exports.pool.execute(sql, params);
    return {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
    };
}
async function withTransaction(callback) {
    const connection = await exports.pool.getConnection();
    await connection.beginTransaction();
    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
exports.default = exports.pool;
//# sourceMappingURL=database.js.map