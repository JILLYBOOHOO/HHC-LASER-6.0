const fs = require('fs');
const path = require('path');
const https = require('https');

const mdPath = 'C:\\\\Users\\\\jovau\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b13aa19f-d747-4604-924c-19f46b2df496\\\\browser\\\\scratchpad_h0161hdi.md';
const content = fs.readFileSync(mdPath, 'utf8');

// Extract JSON block
const match = content.match(/```json\n([\s\S]*?)\n```/);
if (!match) {
    console.error('No JSON found in scratchpad');
    process.exit(1);
}

const treatments = JSON.parse(match[1]);
const outDir = path.join(__dirname, 'frontend/public/hhclaser_img/hhclaser_images/live');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err.message);
        });
    });
}

async function run() {
    const updatedServices = [];
    
    for (const t of treatments) {
        if (!t.image_url) continue;
        
        const ext = path.extname(new URL(t.image_url).pathname) || '.jpg';
        const safeName = t.name.replace(/[^a-zA-Z0-9 ]/g, '_').replace(/_+/g, '_');
        const filename = `${t.id}_${safeName}${ext}`;
        const dest = path.join(outDir, filename);
        
        console.log(`Downloading ${t.name}...`);
        try {
            await download(t.image_url, dest);
            
            // Map category names to IDs to match current implementation
            let catId = 1; // default Body & Wellness
            const catNameLower = (t.category_name || '').toLowerCase();
            if (catNameLower.includes('hair removal')) catId = 4;
            else if (catNameLower.includes('botox') || catNameLower.includes('filler') || catNameLower.includes('inject')) catId = 2;
            else if (catNameLower.includes('facial') || catNameLower.includes('skin') || catNameLower.includes('dark spot') || catNameLower.includes('acne')) catId = 3;
            else if (catNameLower.includes('body')) catId = 1;
            else if (catNameLower.includes('fungal') || catNameLower.includes('keloid') || catNameLower.includes('hair restoration') || catNameLower.includes('iv therapy')) catId = 3;
            
            const priceNum = parseFloat((t.price || '0').replace(/[^\d.-]/g, ''));
            
            updatedServices.push({
                id: t.id,
                category_id: catId,
                category_name: catId === 1 ? 'Body & Wellness' : catId === 2 ? 'Injectables & Aesthetics' : catId === 3 ? 'Facial & Skin Treatments' : 'Laser Hair Removal',
                name: t.name,
                price_jmd: priceNum,
                duration_minutes: t.duration || 0,
                short_description: t.description || '',
                thumbnail_url: `/hhclaser_img/hhclaser_images/live/${filename}`
            });
        } catch (e) {
            console.error(`Failed to download ${t.name}:`, e);
        }
    }
    
    // Write out the JS code snippet to inject into services.component.ts
    const code = `    const treatments: Partial<Service>[] = ${JSON.stringify(updatedServices, null, 2)};`;
    fs.writeFileSync('new_treatments.js', code);
    console.log('Done!');
}

run();
