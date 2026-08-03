const Database = require('better-sqlite3');
const db = new Database('backend/database.sqlite');
const services = db.prepare('SELECT name, price_jmd FROM services').all();
services.forEach(s => console.log(`${s.name}: ${s.price_jmd}`));
