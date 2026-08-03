const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const galleries = JSON.parse(fs.readFileSync('../live_galleries.json', 'utf8'));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();

  try {
    for (const [id, gallery] of Object.entries(galleries)) {
      await client.query(
        'UPDATE services SET gallery_images = $1 WHERE id = $2',
        [JSON.stringify(gallery), id]
      );
    }
    console.log('Updated database with live galleries!');
    
    // Also, clear out the gallery_images for any service that DOES NOT have one
    const idsWithGallery = Object.keys(galleries).join(',');
    if (idsWithGallery.length > 0) {
      await client.query(
        `UPDATE services SET gallery_images = NULL WHERE id NOT IN (${idsWithGallery})`
      );
      console.log('Cleared gallery_images for services without galleries on live site.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
