require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const r = await c.query(
    `UPDATE services
     SET short_description = $1,
         description = $2
     WHERE id = 69 OR slug = 'test-service'
     RETURNING id, name, price_jmd, short_description`,
    [
      'Short booking for verifying live checkout (JMD $200).',
      'Standard booking at JMD $200. Completes through the normal live Fiserv checkout flow.',
    ]
  );
  console.log(r.rows[0] || 'NOT FOUND');
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
