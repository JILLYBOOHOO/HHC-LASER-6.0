require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const dataPath = path.join(__dirname, '../../frontend/src/app/core/data/services.data.ts');
const text = fs.readFileSync(dataPath, 'utf8');
const ids = [...text.matchAll(/\{\s*id:\s*(\d+)/g)].map((m) => Number(m[1]));
console.log('Catalog ids', ids.length, 'first', ids.slice(0, 5));

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  // Put unknown/extra services after the live catalog
  await client.query('UPDATE services SET sort_order = 10000');

  for (let i = 0; i < ids.length; i++) {
    await client.query('UPDATE services SET sort_order = $1 WHERE id = $2', [i + 1, ids[i]]);
  }

  const rows = await client.query(
    `SELECT id, name, sort_order
     FROM services
     WHERE is_active = true
     ORDER BY sort_order ASC, id ASC
     LIMIT 10`
  );
  console.log('Updated sort_order for', ids.length, 'services');
  console.log('First 10 now:', rows.rows);
  await client.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
