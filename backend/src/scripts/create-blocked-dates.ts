import { executeUpdate } from '../config/database';

async function setupDatabase() {
  try {
    // 1. Create blocked_dates table
    await executeUpdate(`
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        blocked_date DATE NOT NULL UNIQUE,
        reason VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('✅ Successfully verified/created blocked_dates table');

    // 2. Alter appointments table to add service_id if not exists
    try {
      await executeUpdate(`
        ALTER TABLE appointments 
        ADD COLUMN service_id INT UNSIGNED DEFAULT NULL AFTER booked_for_user_id
      `);
      console.log('✅ Successfully added service_id column to appointments table');
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ service_id column already exists in appointments table');
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
