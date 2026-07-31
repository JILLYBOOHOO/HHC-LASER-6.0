const fs = require('fs');
const content = fs.readFileSync('C:\\\\Users\\\\jovau\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b13aa19f-d747-4604-924c-19f46b2df496\\\\.system_generated\\\\steps\\\\970\\\\content.md', 'utf8');
const match = content.match(/data-page=\"(.*?)\"/);
if (match) {
  const jsonStr = match[1].replace(/&quot;/g, '"');
  const data = JSON.parse(jsonStr);
  const categories = data.props.categories || [];
  let out = [];
  categories.forEach(c => {
    out.push(`Category: ${c.name} Image: ${c.image_url}`);
    if(c.treatments) {
       c.treatments.forEach(t => out.push(`  Treatment: ${t.name} Image: ${t.image_url}`));
    }
  });
  console.log(out.join('\n'));
} else {
  console.log('No data-page found');
}
