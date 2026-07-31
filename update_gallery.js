const fs = require('fs');
const path = require('path');

const tsPath = 'frontend/src/app/features/public/gallery/gallery.component.ts';
let content = fs.readFileSync(tsPath, 'utf8');

const liveGalleryDir = 'frontend/public/images/live_gallery';
const servicesGalleryDir = 'frontend/public/hhclaser_img/hhclaser_images/live';

let images = [];

if (fs.existsSync(liveGalleryDir)) {
    const files = fs.readdirSync(liveGalleryDir).filter(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i));
    images.push(...files.map(f => `'live_gallery/${f}'`));
}

if (fs.existsSync(servicesGalleryDir)) {
    const files = fs.readdirSync(servicesGalleryDir).filter(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i));
    images.push(...files.map(f => `'../hhclaser_img/hhclaser_images/live/${f}'`));
}

const replacement = `images = [\n    ${images.join(',\n    ')}\n  ];`;
const regex = /images = \[\s*[\s\S]*?\s*\];/;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(tsPath, content);
    console.log('Successfully updated gallery.component.ts');
} else {
    console.error('Could not find images array in gallery.component.ts');
}
