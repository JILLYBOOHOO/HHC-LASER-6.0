import pool from '../src/config/database';

async function migrate() {
  try {
    console.log('Migrating...');
    await pool.query("ALTER TABLE users MODIFY password_hash VARCHAR(255) DEFAULT NULL;");
    await pool.query("ALTER TABLE users ADD COLUMN authentication_method ENUM('Email Password', 'Google OAuth') NOT NULL DEFAULT 'Email Password' AFTER token_version;");
    await pool.query("ALTER TABLE users ADD COLUMN last_login DATETIME DEFAULT NULL AFTER authentication_method;");
    console.log('Migration successful');
  } catch (err) {
    // If columns already exist it might fail, that's fine
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
