// Parse Inertia.js data from the services page to get treatment-image mapping
const fs = require('fs');

async function extractServiceImages() {
  // Fetch the main services page
  const res = await fetch('https://hhclaser.com/services');
  const html = await res.text();
  
  // Extract Inertia.js data-page attribute
  const match = html.match(/data-page="([^"]+)"/);
  if (!match) {
    console.log('No Inertia data found');
    return;
  }
  
  const raw = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'");
  
  const pageData = JSON.parse(raw);
  
  // Write full props to file for inspection
  fs.writeFileSync('live_services_props.json', JSON.stringify(pageData.props, null, 2));
  console.log('Props keys:', Object.keys(pageData.props));
  
  // Check treatments
  const treatments = pageData.props.treatments || pageData.props.services || [];
  console.log(`\nTreatments count: ${treatments.length}`);
  
  if (treatments.length > 0) {
    console.log('\nFirst treatment keys:', Object.keys(treatments[0]));
    console.log('\nAll treatments:');
    for (const t of treatments) {
      console.log(`  ${t.name}: image=${t.image_url || t.image || t.thumbnail || t.photo || 'none'}`);
    }
  }
  
  // Also check categories
  const categories = pageData.props.categories || [];
  console.log(`\nCategories count: ${categories.length}`);
  if (categories.length > 0) {
    console.log('First category keys:', Object.keys(categories[0]));
    for (const c of categories) {
      console.log(`  ${c.name}: image=${c.image_url || c.image || 'none'}`);
      if (c.treatments) {
        for (const t of c.treatments) {
          console.log(`    ${t.name}: image=${t.image_url || t.image || t.thumbnail || 'none'}`);
        }
      }
    }
  }
}

extractServiceImages().catch(console.error);
