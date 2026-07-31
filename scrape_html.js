const fs = require('fs');
const cheerio = require('cheerio');

async function scrapeImages() {
  const res = await fetch('https://hhclaser.com/services');
  const html = await res.text();
  
  const $ = cheerio.load(html);
  
  // Find all cards containing an h3 with the service name
  console.log("=== Service Images ===");
  $('h3').each((i, el) => {
    const name = $(el).text().trim();
    // find the img in the same container or previous sibling
    const img = $(el).closest('div').parent().find('img').attr('src');
    
    if (img && name && !img.includes('logo') && !img.includes('svg')) {
      console.log(`"${name}": "${img}",`);
    }
  });
}

scrapeImages().catch(console.error);
