const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();
  try {
    const images = JSON.stringify([
      'https://images.pexels.com/photos/3775120/pexels-photo-3775120.jpeg',
      'https://images.pexels.com/photos/5938272/pexels-photo-5938272.jpeg',
      'https://images.pexels.com/photos/3985331/pexels-photo-3985331.jpeg'
    ]);
    const res = await client.query('UPDATE services SET gallery_images = $1', [images]);
    console.log('Updated rows:', res.rowCount);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
