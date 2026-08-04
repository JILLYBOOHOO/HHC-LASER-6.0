import { Pool, QueryResult } from 'pg';
export declare const pool: Pool;
export declare function testConnection(): Promise<void>;
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
export declare function executeQuery<T = any>(sql: string, params?: any[]): Promise<T[]>;
export declare function executeQueryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
export declare function executeUpdate(sql: string, params?: any[]): Promise<{
    affectedRows: number;
    insertId: number | null;
}>;
export declare function withTransaction<T>(callback: (client: TransactionClient) => Promise<T>): Promise<T>;
export default pool;
//# sourceMappingURL=database.d.ts.map