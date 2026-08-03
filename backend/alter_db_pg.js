const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();
  try {
    await client.query('ALTER TABLE services ADD COLUMN gallery_images JSONB;');
    console.log('Added gallery_images JSONB column.');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error(e);
    }
  } finally {
    await client.end();
  }
}
run();
