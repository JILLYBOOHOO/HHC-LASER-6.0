const Database = require('better-sqlite3');
const db = new Database('backend/database.sqlite');

const updates = [
  { oldName: 'DARK CIRCLES', newName: 'DARK CIRCLES', price: 8000 },
  { oldName: 'SKIN RESURFACING', newName: 'SKIN RESURFACING', price: 15000 },
  { oldName: 'HEAT SHOCK- BODY/ SKIN DETOX', newName: 'HEAT SHOCK BODY DETOX', price: 15000 },
  { oldName: 'ACNE / DARK SPOTS', newName: 'ACNE / DARK SPOTS', price: 20000 },
  { oldName: 'CHEMICAL PEEL', newName: 'CHEMICAL PEEL', price: 15000 },
  { oldName: 'FOLLICULITIS', newName: 'FOLLICULITIS', price: 15000 },
  { oldName: 'MICRONEEDLING PRP', newName: 'MICRONEEDLING/ PRP/ PRF', price: 25000 },
  { oldName: 'TATTOO REMOVAL', newName: 'TATTOO REMOVAL/ SKIN TAGS', price: 15000 },
  { oldName: 'FUNGUS', newName: 'FUNGAL TREATMENT', price: 10000 },
  { oldName: 'HAIR RESTORATION', newName: 'HAIR RESTORATION', price: 20000 },
  { oldName: 'IV THERAPY', newName: 'IV THERAPY', price: 15000 },
  { oldName: 'CELLULITES', newName: 'CELLULITE', price: 20000 },
  { oldName: 'BOTOX Consultation', newName: 'BOTOX / DERMAL FILLERS', price: 16000 }
];

const updateStmt = db.prepare('UPDATE services SET name = @newName, price_jmd = @price WHERE name = @oldName');
const insertStmt = db.prepare(`
    INSERT INTO services (category_id, name, description, short_description, price_jmd, duration_minutes, is_active) 
    VALUES (1, @newName, '...', '...', @price, 30, 1)
`);
const checkStmt = db.prepare('SELECT id FROM services WHERE name = @newName');

for (const u of updates) {
  const res = updateStmt.run(u);
  if (res.changes === 0) {
      const existing = checkStmt.get({ newName: u.newName });
      if(!existing) {
          insertStmt.run({ newName: u.newName, price: u.price });
          console.log(`Inserted ${u.newName}`);
      } else {
          db.prepare('UPDATE services SET price_jmd = @price WHERE name = @newName').run({ price: u.price, newName: u.newName });
          console.log(`Updated existing ${u.newName}`);
      }
  } else {
      console.log(`Updated ${u.oldName} -> ${u.newName} (${u.price})`);
  }
}

const additions = [
  { name: 'DERMAPLANING', price: 10000 },
  { name: 'LASER RESURFACING', price: 20000 }
];
for(const a of additions) {
    if(!checkStmt.get({ newName: a.name })) {
        insertStmt.run({ newName: a.name, price: a.price });
        console.log(`Inserted ${a.name}`);
    }
}
