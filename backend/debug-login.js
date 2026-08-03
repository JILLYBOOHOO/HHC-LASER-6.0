// Debug: test exactly what findUserWithRoles does
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

// Simulate exactly what executeQuery does
const runQuery = async (sql, params = []) => {
  sql = sql.replace(/NOW\(\)/g, "DATETIME('now')");
  sql = sql.replace(/COALESCE/gi, 'COALESCE');
  sql = sql.replace(/ON DUPLICATE KEY UPDATE/gi, 'ON CONFLICT DO UPDATE SET');
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    const stmt = db.prepare(sql);
    return [stmt.all(...params)];
  } else {
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);
    return [{ affectedRows: info.changes, insertId: info.lastInsertRowid }];
  }
};

const executeQuery = async (sql, params = []) => {
  const [rows] = await runQuery(sql, params);
  return rows;
};

async function findUserWithRoles(userId, email) {
  const whereClause = userId ? 'u.id = ?' : 'u.email = ?';
  const param = userId || email;

  console.log('Calling findUserWithRoles with param:', param, 'whereClause:', whereClause);

  const rows = await executeQuery(
    `SELECT u.*, ur.role FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id WHERE ${whereClause}`,
    [param]
  );

  console.log('Rows returned:', JSON.stringify(rows, null, 2));
  return rows;
}

findUserWithRoles(undefined, 'kake.101buchanan@gmail.com').then(r => {
  console.log('Final result length:', r.length);
  if (r.length) {
    console.log('is_active:', r[0].is_active, typeof r[0].is_active);
    console.log('email_verified:', r[0].email_verified, typeof r[0].email_verified);
    console.log('password_hash:', r[0].password_hash ? 'EXISTS' : 'MISSING');
  }
}).catch(console.error);
