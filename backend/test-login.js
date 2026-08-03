const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

async function test() {
  const user = db.prepare("SELECT * FROM users WHERE email=?").get('kake.101buchanan@gmail.com');
  console.log('User found:', !!user);
  console.log('Hash:', user.password_hash);
  const match = await bcrypt.compare('Godluvme.7', user.password_hash);
  console.log('Password match:', match);
  
  // Also test via HTTP
  const http = require('http');
  const body = JSON.stringify({ email: 'kake.101buchanan@gmail.com', password: 'Godluvme.7' });
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Login response:', res.statusCode, data));
  });
  req.on('error', e => console.error('Request error:', e.message));
  req.write(body);
  req.end();
}
test().catch(console.error);
