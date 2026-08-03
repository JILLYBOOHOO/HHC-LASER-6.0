const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const stepsDir = 'C:\\\\Users\\\\jovau\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b13aa19f-d747-4604-924c-19f46b2df496\\\\.system_generated\\\\steps';
const dirs = fs.readdirSync(stepsDir);

let allTreatments = {};

dirs.forEach(dir => {
    const contentPath = path.join(stepsDir, dir, 'content.md');
    if (fs.existsSync(contentPath)) {
        const content = fs.readFileSync(contentPath, 'utf8');
        try {
            const $ = cheerio.load(content);
            // Treatments are usually in a flex column card
            // Let's find all h3 elements, then find the closest parent that contains an image
            $('h3, h4').each((i, el) => {
                const title = $(el).text().trim().replace(/&amp;/g, '&');
                const card = $(el).closest('div.relative, div.flex-col, .group'); // Try to find a wrapper
                let img = card.find('img').first().attr('src');
                
                // If not in wrapper, maybe previous element
                if (!img) {
                    img = $(el).parent().parent().find('img').attr('src');
                }
                
                if (img && title && img.includes('digitaloceanspaces.com') && !title.includes('Company') && !title.includes('Support')) {
                    allTreatments[title] = img;
                }
            });
        } catch (e) {}
    }
});

fs.writeFileSync('C:\\\\Users\\\\jovau\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b13aa19f-d747-4604-924c-19f46b2df496\\\\scratch\\\\extracted_treatments.json', JSON.stringify(allTreatments, null, 2));
console.log('Saved ' + Object.keys(allTreatments).length + ' treatments');
