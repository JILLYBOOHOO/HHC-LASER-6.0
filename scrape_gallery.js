const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'text/html' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetch('https://hhclaser.com/gallery');
  
  // Extract the data-page attribute from the #app div
  const match = html.match(/data-page="([^"]+)"/);
  if (!match) {
    console.error('Could not find data-page attribute');
    process.exit(1);
  }
  
  // Decode HTML entities
  const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const pageData = JSON.parse(decoded);
  
  console.log('Page component:', pageData.component);
  console.log('Props keys:', Object.keys(pageData.props));
  
  // Write full props to file for inspection
  fs.writeFileSync('gallery_props.json', JSON.stringify(pageData.props, null, 2));
  console.log('Written gallery_props.json');
  
  // Look for gallery-specific data in props
  for (const [key, value] of Object.entries(pageData.props)) {
    if (key === 'ziggy' || key === 'seo' || key === 'auth') continue;
    console.log(`\nProp: ${key}`);
    if (Array.isArray(value)) {
      console.log(`  Array with ${value.length} items`);
      if (value.length > 0) {
        console.log('  First item:', JSON.stringify(value[0], null, 2));
      }
    } else if (typeof value === 'object' && value !== null) {
      console.log('  Object keys:', Object.keys(value));
      // Check for nested arrays
      for (const [k2, v2] of Object.entries(value)) {
        if (Array.isArray(v2)) {
          console.log(`  ${k2}: Array with ${v2.length} items`);
          if (v2.length > 0) console.log('    First item:', JSON.stringify(v2[0], null, 2));
        }
      }
    } else {
      console.log('  Value:', value);
    }
  }
}

main().catch(console.error);
