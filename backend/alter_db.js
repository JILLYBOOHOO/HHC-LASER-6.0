const sqlite3 = require('sqlite3').verbose(); 
const db = new sqlite3.Database('./hhclaser.db'); 
db.serialize(() => { 
  db.run('ALTER TABLE services ADD COLUMN gallery_images TEXT', (err) => { 
    if (err) console.error(err); 
    else console.log('Added gallery_images column'); 
  }); 
}); 
db.close();
