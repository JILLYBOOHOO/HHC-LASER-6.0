const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('database.sqlite');

async function seed() {
  const users = [
    { email: 'infohhcLaser@gmail.com', pass: 'Godluvme.5', fname: 'HHC', lname: 'Owner', role: 'admin' },
    { email: 'kake.101buchanan@gmail.com', pass: 'Godluvme.7', fname: 'Developer', lname: 'Buchanan', role: 'admin' },
    { email: 'staff@hhclaser.com', pass: 'Staff@123!', fname: 'Sarah', lname: 'Jenkins', role: 'specialist' },
    { email: 'customer@hhclaser.com', pass: 'Customer@123!', fname: 'Olivia', lname: 'Rhoden', role: 'customer' }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.pass, 10);
    const result = db.prepare('INSERT INTO users (email, password_hash, first_name, last_name, is_active, email_verified) VALUES (?, ?, ?, ?, 1, 1)').run(u.email, hash, u.fname, u.lname);
    const userId = result.lastInsertRowid;
    db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(userId, u.role);
    console.log(`Inserted ${u.email} with role ${u.role}`);
  }
}
seed().catch(console.error);
