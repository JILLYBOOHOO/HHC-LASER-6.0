import mysql from 'mysql2/promise';
import { env } from '../config/env';

/**
 * Migration script to update the database schema and data for the multi-channel booking and payment system.
 * 
 * 1. Backfills `booking_source = 'website'` for any NULL sources
 * 2. Maps legacy payment statuses ('unpaid' -> 'pending_payment', 'paid' -> 'paid_online')
 * 3. Adds necessary audit columns to the `transactions` table if missing
 */
async function runMigration() {
  console.log('Connecting to database...');
  
  const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: env.DB_PORT,
    waitForConnections: true,
    connectionLimit: env.DB_CONNECTION_LIMIT,
    queueLimit: 0
  });

  try {
    const connection = await pool.getConnection();
    console.log('Connected. Starting migration...');
    
    await connection.beginTransaction();
    
    try {
      // 1. Alter appointments table payment_status enum to include new values
      console.log('Altering appointments table payment_status ENUM...');
      await connection.query(`
        ALTER TABLE appointments 
        MODIFY COLUMN payment_status ENUM(
          'pending_payment', 
          'paid_online', 
          'paid_in_store', 
          'paid_by_phone', 
          'deposit_paid', 
          'pay_at_appointment', 
          'refunded', 
          'complimentary',
          'unpaid',
          'paid',
          'failed',
          'cancelled'
        ) NOT NULL DEFAULT 'pending_payment'
      `);

      // 2. Map legacy payment statuses
      console.log('Mapping legacy payment statuses...');
      await connection.query(`
        UPDATE appointments SET payment_status = 'pending_payment' WHERE payment_status = 'unpaid'
      `);
      await connection.query(`
        UPDATE appointments SET payment_status = 'paid_online' WHERE payment_status = 'paid'
      `);

      // 3. Remove legacy values from ENUM (this is a two-step process in MySQL)
      console.log('Cleaning up appointments table payment_status ENUM...');
      await connection.query(`
        ALTER TABLE appointments 
        MODIFY COLUMN payment_status ENUM(
          'pending_payment', 
          'paid_online', 
          'paid_in_store', 
          'paid_by_phone', 
          'deposit_paid', 
          'pay_at_appointment', 
          'refunded', 
          'complimentary',
          'failed',
          'cancelled'
        ) NOT NULL DEFAULT 'pending_payment'
      `);

      // 4. Backfill booking_source if missing/NULL
      console.log('Backfilling missing booking_source...');
      await connection.query(`
        UPDATE appointments SET booking_source = 'website' WHERE booking_source IS NULL OR booking_source = ''
      `);

      // 5. Ensure transactions table has new audit columns
      console.log('Checking transactions table structure...');
      
      const [columns] = await connection.query<any[]>(`SHOW COLUMNS FROM transactions`);
      
      const hasRecordedBy = columns.some(c => c.Field === 'recorded_by_user_id');
      const hasPaymentMethod = columns.some(c => c.Field === 'payment_method');
      const hasFiservResponseMsg = columns.some(c => c.Field === 'fiserv_response_message');

      if (!hasRecordedBy) {
        console.log('Adding recorded_by_user_id column to transactions...');
        await connection.query(`
          ALTER TABLE transactions 
          ADD COLUMN recorded_by_user_id INT UNSIGNED DEFAULT NULL,
          ADD CONSTRAINT fk_transactions_recorded_by FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        `);
      }

      if (!hasPaymentMethod) {
        console.log('Adding payment_method column to transactions...');
        await connection.query(`
          ALTER TABLE transactions 
          ADD COLUMN payment_method ENUM('card_online', 'card_in_store', 'card_terminal', 'cash', 'bank_transfer', 'other') NULL DEFAULT 'card_online'
        `);
      }
      
      if (!hasFiservResponseMsg) {
        console.log('Adding fiserv_response_message column to transactions...');
        await connection.query(`
          ALTER TABLE transactions 
          ADD COLUMN fiserv_response_message VARCHAR(255) NULL
        `);
      }

      await connection.commit();
      console.log('✅ Migration completed successfully.');
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Migration failed during transaction. Changes rolled back.', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('❌ Database connection or overall execution error:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();
