"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
async function checkSchema() {
    try {
        const apptCols = await (0, database_1.executeQuery)('DESCRIBE appointments');
        console.log('--- APPOINTMENTS COLUMNS ---');
        console.log(apptCols);
        const txnCols = await (0, database_1.executeQuery)('DESCRIBE transactions');
        console.log('--- TRANSACTIONS COLUMNS ---');
        console.log(txnCols);
    }
    catch (err) {
        console.error('Error describing schema:', err);
    }
    finally {
        process.exit(0);
    }
}
checkSchema();
//# sourceMappingURL=check-db-schema.js.map