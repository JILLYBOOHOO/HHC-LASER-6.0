const Database = require('better-sqlite3');
const db = new Database('backend/database.sqlite');

const updates = [
  { name: 'WOOD THERAPY', image: 'https://hhclaserco.sfo3.digitaloceanspaces.com/services/EoabYcRz9SeSXzn1J486TQ7Fmaild3jgycIE2LnJ.jpg' },
  { name: 'Heat shock body detox', image: 'https://hhclaserco.sfo3.digitaloceanspaces.com/services/fC9NBPbpcZnjlpLNqMBxelxwSDiUOasVgiDPSoYK.jpg' },
  { name: 'Dark circles', image: 'https://hhclaserco.sfo3.digitaloceanspaces.com/services/F8xCdXfQtBoWx16u2OXE7kKKfcLo5rl9l0k7gJbH.webp' },
  { name: 'Stretch marks', image: 'https://hhclaserco.sfo3.digitaloceanspaces.com/services/GR8uaDTCcu9H1vZ9HJiKg0kQ7veNRXM6LUmprc9R.jpg' },
  { name: 'Skin Resurfacing', image: 'https://hhclaserco.sfo3.digitaloceanspaces.com/services/MsZnunZWBaU63ftzpzaUEgZq7yuOVBpeuAt4ZkPN.jpg' },
  { name: 'Folliculitis', image: 'https://hhclaserco.sfo3.digitaloceanspaces.com/services/DNwdcT0DyfadN2TD40UE8aFdCPmizmSLJhwPbCpp.jpg' },
  { name: 'Acne / Dark Spots', image: 'https://hhclaserco.sfo3.digitaloceanspaces.com/services/vMElxU79WO8YjMSniRBM04IVwSSKuCfu13849fm6.jpg' }
];

const stmt = db.prepare('UPDATE services SET thumbnail_url = @image WHERE name LIKE @name');

for (const u of updates) {
  const res = stmt.run({ image: u.image, name: '%' + u.name + '%' });
  console.log(`Updated ${res.changes} for ${u.name}`);
}
