import mysql, { Pool } from 'mysql2/promise';
export declare const pool: Pool;
export declare function testConnection(): Promise<void>;
export declare function executeQuery<T = any>(sql: string, params?: any[]): Promise<T[]>;
export declare function executeQueryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
export declare function executeUpdate(sql: string, params?: any[]): Promise<{
    affectedRows: number;
    insertId: number;
}>;
export declare function withTransaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T>;
export default pool;
//# sourceMappingURL=database.d.ts.map