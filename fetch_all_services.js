const fs = require('fs');

async function fetchAllServices() {
  const categories = require('C:\\Users\\jovau\\.gemini\\antigravity-ide\\brain\\b13aa19f-d747-4604-924c-19f46b2df496\\scratch\\live_services3.json');
  const allServices = [];

  for (const cat of categories) {
    try {
      console.log(`Fetching category: ${cat.name} (${cat.id})`);
      const res = await fetch(`https://hhclaser.com/services/${cat.id}/${cat.slug}`);
      const text = await res.text();
      const match = text.match(/data-page="([^"]+)"/);
      if (match) {
        const decoded = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(decoded);
        let svcs = data.props.treatments || [];
        if (svcs.data) svcs = svcs.data; // Handle pagination wrappers
        
        allServices.push({
          category: cat,
          services: svcs
        });
      }
    } catch (e) {
      console.error(`Error fetching ${cat.name}:`, e.message);
    }
  }

  fs.writeFileSync('C:\\Users\\jovau\\.gemini\\antigravity-ide\\brain\\b13aa19f-d747-4604-924c-19f46b2df496\\scratch\\live_services_full.json', JSON.stringify(allServices, null, 2));
  console.log('Saved all services data!');
}
fetchAllServices();
