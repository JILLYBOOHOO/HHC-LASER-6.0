const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

// Check if services table exists
if (tables.find(t => t.name === 'services')) {
  const count = db.prepare('SELECT COUNT(*) as c FROM services').get();
  console.log('Service count:', count.c);
  const services = db.prepare('SELECT name, price_jmd, duration_minutes FROM services LIMIT 10').all();
  console.log('Sample services:', JSON.stringify(services, null, 2));
} else {
  console.log('No services table found!');
}
