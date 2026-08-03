const fs = require('fs');

async function fetchServices() {
  const res = await fetch('https://hhclaser.com/services');
  const text = await res.text();
  
  const match = text.match(/data-page="([^"]+)"/);
  if (match) {
    const decoded = match[1].replace(/&quot;/g, '"');
    const data = JSON.parse(decoded);
    fs.writeFileSync('C:\\Users\\jovau\\.gemini\\antigravity-ide\\brain\\b13aa19f-d747-4604-924c-19f46b2df496\\scratch\\live_services3.json', JSON.stringify(data.props.categories || data.props, null, 2));
    console.log('Categories:', data.props.categories ? data.props.categories.length : 'Not found');
  } else {
    console.log('data-page not found');
  }
}
fetchServices();
