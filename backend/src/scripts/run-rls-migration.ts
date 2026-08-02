import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sqlPath = path.join(__dirname, '../../../database/migrations/003_enable_rls.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);

  const rls = await pool.query(`
    SELECT c.relname as table_name, c.relrowsecurity as rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  `);

  const policies = await pool.query(`
    SELECT COUNT(*)::int as count FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE 'hhc_%'
  `);

  console.log('RLS enabled on tables:');
  for (const row of rls.rows) {
    console.log(`  ${row.table_name}: ${row.rls_enabled ? 'ON' : 'OFF'}`);
  }
  console.log(`Policies created: ${policies.rows[0].count}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
