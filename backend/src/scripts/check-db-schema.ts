import { executeQuery } from '../config/database';

async function checkSchema() {
  try {
    const apptCols = await executeQuery('DESCRIBE appointments');
    console.log('--- APPOINTMENTS COLUMNS ---');
    console.log(apptCols);

    const txnCols = await executeQuery('DESCRIBE transactions');
    console.log('--- TRANSACTIONS COLUMNS ---');
    console.log(txnCols);
  } catch (err) {
    console.error('Error describing schema:', err);
  } finally {
    process.exit(0);
  }
}

checkSchema();
