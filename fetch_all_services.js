// Fetch all treatments from each category on the live site
async function fetchAllTreatments() {
  // First get all categories
  const catRes = await fetch('https://hhclaser.com/api/categories');
  const catData = await catRes.json();
  
  const allTreatments = [];
  
  for (const cat of catData.categories) {
    console.log(`\n=== Category: ${cat.name} (ID: ${cat.id}) ===`);
    
    // Try fetching the service page which lists treatments
    try {
      const pageRes = await fetch(`https://hhclaser.com/services/${cat.id}/${cat.slug}`);
      const html = await pageRes.text();
      
      // Look for Inertia.js page data (common in Laravel apps)
      const inertiaMatch = html.match(/data-page="([^"]+)"/);
      if (inertiaMatch) {
        const pageData = JSON.parse(inertiaMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
        if (pageData.props) {
          // Look for treatments/services in props
          const props = pageData.props;
          if (props.treatments) {
            for (const t of props.treatments) {
              console.log(`  ${t.name}: image=${t.image_url || t.thumbnail_url || 'none'}`);
              allTreatments.push({
                name: t.name,
                category: cat.name,
                image_url: t.image_url || t.thumbnail_url || null,
                price: t.price || t.formatted_price
              });
            }
          }
          if (props.category && props.category.treatments) {
            for (const t of props.category.treatments) {
              console.log(`  ${t.name}: image=${t.image_url || t.thumbnail_url || 'none'}`);
              allTreatments.push({
                name: t.name,
                category: cat.name,
                image_url: t.image_url || t.thumbnail_url || null,
                price: t.price || t.formatted_price
              });
            }
          }
          // Just dump all props keys for debugging
          console.log('  Props keys:', Object.keys(props));
        }
      }
      
      // Also look for __NEXT_DATA__ or similar
      const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
      if (nextMatch) {
        const nd = JSON.parse(nextMatch[1]);
        console.log('  NEXT_DATA props:', Object.keys(nd.props?.pageProps || {}));
      }
      
      // Look for image URLs in the HTML
      const imgMatches = html.match(/src="(https:\/\/[^"]*\.(jpg|jpeg|png|webp|gif)[^"]*)"/gi);
      if (imgMatches) {
        const unique = [...new Set(imgMatches.map(m => m.match(/src="([^"]+)"/)[1]))];
        const nonStock = unique.filter(u => !u.includes('pexels') && !u.includes('wikimedia') && !u.includes('fontawesome'));
        if (nonStock.length > 0) {
          console.log('  Non-stock images:', nonStock);
        }
      }
      
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
  
  // Try individual service endpoints
  console.log('\n\n=== Trying individual service endpoint ===');
  for (let id = 1; id <= 70; id++) {
    try {
      const res = await fetch(`https://hhclaser.com/service/${id}`, { redirect: 'follow' });
      if (res.ok) {
        const html = await res.text();
        // Check for Inertia data
        const inertiaMatch = html.match(/data-page="([^"]+)"/);
        if (inertiaMatch) {
          const pageData = JSON.parse(inertiaMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
          const service = pageData.props?.service || pageData.props?.treatment;
          if (service) {
            const imgUrl = service.image_url || service.thumbnail_url || service.photo_url || null;
            console.log(`  ID ${id}: ${service.name} -> ${imgUrl}`);
            allTreatments.push({
              id: id,
              name: service.name,
              image_url: imgUrl
            });
          }
        }
      }
    } catch(e) {}
  }
  
  const fs = require('fs');
  fs.writeFileSync('live_treatment_images.json', JSON.stringify(allTreatments, null, 2));
  console.log(`\nSaved ${allTreatments.length} treatments to live_treatment_images.json`);
}

fetchAllTreatments().catch(console.error);
