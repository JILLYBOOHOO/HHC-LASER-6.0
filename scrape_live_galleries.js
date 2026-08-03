const fs = require('fs');

async function scrapeGalleries() {
  const galleries = {};
  
  for (let id = 1; id <= 70; id++) {
    try {
      const res = await fetch(`https://hhclaser.com/service/${id}`, { redirect: 'follow' });
      if (!res.ok) continue;
      const html = await res.text();
      const inertiaMatch = html.match(/data-page="([^"]+)"/);
      
      if (inertiaMatch) {
        const pageData = JSON.parse(inertiaMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
        const service = pageData.props?.service || pageData.props?.treatment;
        if (service && service.gallery && service.gallery.length > 0) {
          galleries[id] = service.gallery;
          console.log(`Scraped gallery for ID ${id} (${service.name}): ${service.gallery.length} items`);
        }
      }
    } catch(e) {
      // Ignore errors for non-existent IDs
    }
  }
  
  fs.writeFileSync('live_galleries.json', JSON.stringify(galleries, null, 2));
  console.log('Saved to live_galleries.json');
}

scrapeGalleries().catch(console.error);
