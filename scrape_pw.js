const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeImages() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://hhclaser.com/services', { waitUntil: 'networkidle' });
  
  const mappings = await page.evaluate(() => {
    const results = {};
    const cards = document.querySelectorAll('.group.relative.bg-white');
    cards.forEach(card => {
      const nameEl = card.querySelector('h3');
      const imgEl = card.querySelector('img');
      if (nameEl && imgEl) {
        results[nameEl.innerText.trim()] = imgEl.src;
      }
    });
    return results;
  });
  
  console.log(JSON.stringify(mappings, null, 2));
  
  await browser.close();
}

scrapeImages().catch(console.error);
