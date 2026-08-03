const fs = require('fs');
const t = fs.readFileSync('hhc_treatments.html', 'utf8');
const regex = /href="([^"]+)"/g;
let match;
const links = new Set();
while ((match = regex.exec(t)) !== null) {
  links.add(match[1]);
}
console.log(Array.from(links));
