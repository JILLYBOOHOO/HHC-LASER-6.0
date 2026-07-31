const Database = require('better-sqlite3');
const db = new Database('backend/database.sqlite');
const services = db.prepare('SELECT id, name, thumbnail_url FROM services').all();
services.forEach(s => console.log(`${s.id}: ${s.name}`));
