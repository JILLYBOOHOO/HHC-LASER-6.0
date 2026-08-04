const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  console.log('Tables:', res.rows.map(r => r.table_name));

  for (let r of res.rows) {
    const table = r.table_name;
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    console.log(`\nTable: ${table}`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }

  await client.end();
}

run().catch(console.error);
