const { executeQuery } = require('./dist/config/database');
executeQuery("SELECT pg_get_constraintdef(c.oid) AS constraint_def FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE c.conrelid = 'appointments'::regclass AND c.contype = 'c'").then(console.log).catch(console.error).finally(() => process.exit(0));
