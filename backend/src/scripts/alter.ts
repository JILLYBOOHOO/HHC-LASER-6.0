import { executeUpdate } from '../config/database';

async function addConfirmationCode() {
  try {
    await executeUpdate(`
      ALTER TABLE appointments 
      ADD COLUMN confirmation_code VARCHAR(20) DEFAULT NULL AFTER notes
    `);
    console.log('Successfully added confirmation_code to appointments table');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error('Error:', error);
    }
  } finally {
    process.exit(0);
  }
}

addConfirmationCode();
