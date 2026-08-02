"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
async function migrateTransactionsTable() {
    try {
        console.log('Running database migration for transactions table...');
        try {
            await (0, database_1.executeUpdate)(`ALTER TABLE transactions ADD COLUMN fiserv_response_message VARCHAR(255) DEFAULT NULL AFTER fiserv_response_code`);
            console.log('✅ Added fiserv_response_message column');
        }
        catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME')
                console.log('ℹ️ fiserv_response_message column already exists');
            else
                throw e;
        }
        console.log('Migration completed successfully!');
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
    finally {
        process.exit(0);
    }
}
migrateTransactionsTable();
//# sourceMappingURL=alter-transactions-table.js.map