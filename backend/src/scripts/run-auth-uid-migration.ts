import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function main() {
  const sqlPath = path.join(__dirname, '../../../database/migrations/001_add_auth_uid.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_uid'`
  );
  console.log('Migration applied. auth_uid present:', result.rows.length > 0);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
