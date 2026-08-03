const fs = require('fs');
const path = require('path');
const https = require('https');

const galleries = require('./gallery_props.json').galleries;

const outDir = path.join(__dirname, 'frontend/public/images/live_gallery');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const getter = url.startsWith('https') ? https : require('http');
        getter.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return download(response.headers.location, dest).then(resolve).catch(reject);
            }
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on('finish', () => file.close(resolve));
            } else {
                reject(`Server responded with ${response.statusCode} for ${url}`);
            }
        }).on('error', reject);
    });
}

async function main() {
    const galleryData = [];

    for (const item of galleries) {
        const ext = path.extname(new URL(item.image_url).pathname) || '.jpg';
        const safeName = item.title.replace(/[^a-zA-Z0-9 ]/g, '_').replace(/_+/g, '_').trim();
        const filename = `gallery_${item.id}_${safeName}${ext}`;
        const dest = path.join(outDir, filename);

        console.log(`Downloading [${item.id}] ${item.title}...`);
        try {
            await download(item.image_url, dest);
            galleryData.push({
                id: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                alt_text: item.alt_text,
                is_featured: item.is_featured,
                sort_order: item.sort_order,
                local_path: `live_gallery/${filename}`
            });
            console.log(`  -> Saved as ${filename}`);
        } catch (e) {
            console.error(`  -> FAILED: ${e}`);
        }
    }

    // Sort by sort_order
    galleryData.sort((a, b) => a.sort_order - b.sort_order);

    fs.writeFileSync('gallery_data.json', JSON.stringify(galleryData, null, 2));
    console.log(`\nDone! ${galleryData.length} gallery images downloaded.`);
}

main().catch(console.error);
