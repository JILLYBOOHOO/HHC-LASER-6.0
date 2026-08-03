import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const r = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log(r.rows.map((x) => x.tablename).join('\n'));
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
