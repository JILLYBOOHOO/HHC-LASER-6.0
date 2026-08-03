const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Go to the bookings page
    await page.goto('https://hhclaser.com/treatments/bookings', { waitUntil: 'networkidle2' });
    
    // Wait for the treatments to load
    await page.waitForSelector('.grid > div');
    
    // Click on all categories to load all treatments
    // But actually we just need to click "All Treatments" or iterate over categories
    
    const results = await page.evaluate(async () => {
        const treatments = {};
        
        // Let's get the categories first
        const buttons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() !== '' && b.innerText !== 'All Treatments');
        
        for (let btn of buttons) {
            btn.click();
            // Wait a bit for transition
            await new Promise(r => setTimeout(r, 1000));
            
            const cards = document.querySelectorAll('.grid > div');
            cards.forEach(card => {
                const img = card.querySelector('img');
                const title = card.querySelector('h3, h4');
                const p = card.querySelector('p'); // maybe description
                if (img && title) {
                    const name = title.innerText.trim();
                    const src = img.src;
                    treatments[name] = src;
                }
            });
        }
        return treatments;
    });

    console.log(`Found ${Object.keys(results).length} unique treatments.`);
    fs.writeFileSync('C:\\\\Users\\\\jovau\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b13aa19f-d747-4604-924c-19f46b2df496\\\\scratch\\\\puppet_treatments.json', JSON.stringify(results, null, 2));
    
    await browser.close();
})();
