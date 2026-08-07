const { executeQuery } = require('./dist/config/database');
executeQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'appointments'").then(console.log).catch(console.error).finally(() => process.exit(0));
