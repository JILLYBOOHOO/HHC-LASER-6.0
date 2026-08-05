require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const existing = await c.query(
    `SELECT id, name, price_jmd, slug, is_active
     FROM services
     WHERE slug = 'test-service' OR LOWER(name) = LOWER('TEST SERVICE')`
  );

  if (existing.rows.length) {
    console.log('EXISTS', existing.rows[0]);
    await c.end();
    return;
  }

  // Fix sequence if out of sync, then insert
  await c.query(
    `SELECT setval(
       pg_get_serial_sequence('services', 'id'),
       COALESCE((SELECT MAX(id) FROM services), 1)
     )`
  );

  const colsRes = await c.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'services'`
  );
  const cols = new Set(colsRes.rows.map((r) => r.column_name));

  const fields = {
    category_id: 3,
    name: 'TEST SERVICE',
    slug: 'test-service',
    description:
      'Temporary service for payment gateway testing only. Remove after verification.',
    short_description:
      'Temporary J$200 payment test — remove after verifying checkout.',
    price_jmd: 200,
    duration_minutes: 10,
    thumbnail_url:
      '/hhclaser_img/hhclaser_images/Modern luxury clinic reception area.webp',
    is_featured: false,
    is_active: true,
  };

  const insertCols = Object.keys(fields).filter((k) => cols.has(k));
  const values = insertCols.map((k) => fields[k]);
  const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(', ');

  const r = await c.query(
    `INSERT INTO services (${insertCols.join(', ')})
     VALUES (${placeholders})
     RETURNING id, name, price_jmd, slug, is_active, category_id`,
    values
  );

  console.log('CREATED', r.rows[0]);
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
