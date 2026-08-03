const fs = require('fs');
const path = require('path');

const files = [
  'src/scripts/seed-services.ts',
  'src/scripts/seed-demo.ts',
  'src/scripts/seed-admins.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/INSERT IGNORE INTO ([\s\S]*?)(VALUES\s*\([\s\S]*?\))/g, 'INSERT INTO $1$2 ON CONFLICT DO NOTHING');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
