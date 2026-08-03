const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
console.log(`Using database at: ${dbPath}`);

let db;
try {
  db = new Database(dbPath);
  
  // Read live data
  const dataFile = 'C:\\Users\\jovau\\.gemini\\antigravity-ide\\brain\\b13aa19f-d747-4604-924c-19f46b2df496\\scratch\\live_services_full.json';
  const liveData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Clear existing tables
  db.exec('DELETE FROM services;');
  db.exec('DELETE FROM service_categories;');

  const insertCategory = db.prepare(`
    INSERT INTO service_categories (id, name, slug, description, icon_url, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  const insertService = db.prepare(`
    INSERT INTO services (id, category_id, name, slug, description, short_description, duration_minutes, price_jmd, thumbnail_url, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  let orderCat = 0;
  for (const catData of liveData) {
    const cat = catData.category;
    const catName = cat.name.replace(/&amp;/g, '&');
    console.log(`Inserting category: ${catName}`);
    insertCategory.run(
      cat.id,
      catName,
      cat.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      cat.description || null,
      cat.image_url || null,
      orderCat++
    );

    let orderSvc = 0;
    for (const svc of catData.services) {
      // Parse price (e.g. "JMD 1,500.00" -> 1500)
      let price = 0;
      if (svc.formatted_price) {
        price = parseFloat(svc.formatted_price.replace(/[^0-9.]/g, ''));
      } else if (svc.price) {
        price = parseFloat(String(svc.price).replace(/[^0-9.]/g, ''));
      }
      
      if (isNaN(price)) price = 0;
      
      const svcName = svc.name.replace(/&amp;/g, '&');
      console.log(`  - Inserting service: ${svcName}`);
      let slug = svc.slug || svcName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!svc.slug) slug += '-' + svc.id;
      
      insertService.run(
        svc.id,
        cat.id,
        svcName,
        slug,
        svc.description || svc.short_description || null,
        svc.short_description || null,
        svc.duration || 60, // Default duration if not present
        price,
        svc.image_url || cat.image_url || null,
        orderSvc++
      );
    }
  }

  db.exec('COMMIT');
  console.log('Successfully synced live services to local database!');

} catch (err) {
  if (db) db.exec('ROLLBACK');
  console.error('Error seeding database:', err);
} finally {
  if (db) db.close();
}
