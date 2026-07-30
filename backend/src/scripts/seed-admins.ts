import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hhc_laser',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function addAdmins() {
  console.log('Starting custom admin seed...');

  const connection = await pool.getConnection();
  
  try {
    // 1. Create Default Admin (Owner)
    const ownerPassword = await bcrypt.hash('Godluvme.5', 10);
    await connection.query(
      `INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      ['infohhcLaser@gmail.com', ownerPassword, 'HHC', 'Owner', '876-555-0001']
    );
    
    const [owner]: any = await connection.query('SELECT id FROM users WHERE email = ?', ['infohhcLaser@gmail.com']);
    if (owner.length > 0) {
      await connection.query('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)', [owner[0].id, 'admin']);
      console.log('Added infohhcLaser@gmail.com');
    }

    // 2. Create Developer Admin
    const devPassword = await bcrypt.hash('Godluvme.7', 10);
    await connection.query(
      `INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      ['kake.101buchanan@gmail.com', devPassword, 'Developer', 'Buchanan', '876-555-0002']
    );
    
    const [dev]: any = await connection.query('SELECT id FROM users WHERE email = ?', ['kake.101buchanan@gmail.com']);
    if (dev.length > 0) {
      await connection.query('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)', [dev[0].id, 'admin']);
      console.log('Added kake.101buchanan@gmail.com');
    }

    console.log('✅ Admin accounts seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

addAdmins();
