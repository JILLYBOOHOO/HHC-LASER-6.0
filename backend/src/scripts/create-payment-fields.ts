import { executeUpdate } from '../config/database';

async function migratePaymentFields() {
  try {
    console.log('Running database migration for appointment payment fields...');
    
    // Add payment_status
    try {
      await executeUpdate(`ALTER TABLE appointments ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid' AFTER status`);
      console.log('✅ Added payment_status column');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ payment_status column already exists');
      else throw e;
    }

    // Add transaction_id
    try {
      await executeUpdate(`ALTER TABLE appointments ADD COLUMN transaction_id VARCHAR(255) DEFAULT NULL AFTER payment_status`);
      console.log('✅ Added transaction_id column');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ transaction_id column already exists');
      else throw e;
    }

    // Add payment_reference
    try {
      await executeUpdate(`ALTER TABLE appointments ADD COLUMN payment_reference VARCHAR(255) DEFAULT NULL AFTER transaction_id`);
      console.log('✅ Added payment_reference column');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ payment_reference column already exists');
      else throw e;
    }

    // Add amount_paid
    try {
      await executeUpdate(`ALTER TABLE appointments ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0.00 AFTER payment_reference`);
      console.log('✅ Added amount_paid column');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ amount_paid column already exists');
      else throw e;
    }

    // Add payment_date
    try {
      await executeUpdate(`ALTER TABLE appointments ADD COLUMN payment_date DATETIME DEFAULT NULL AFTER amount_paid`);
      console.log('✅ Added payment_date column');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ payment_date column already exists');
      else throw e;
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migratePaymentFields();
