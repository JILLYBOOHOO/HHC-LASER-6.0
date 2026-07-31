const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'frontend/public/hhclaser_img/hhclaser_images');
const files = fs.readdirSync(imgDir).filter(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i));

let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Image Map</title>
  <style>
    body { font-family: sans-serif; background: #222; color: #fff; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px; }
    .card { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
    img { max-width: 100%; height: 200px; object-fit: contain; }
    .filename { margin-top: 10px; font-size: 12px; word-break: break-all; }
  </style>
</head>
<body>
  <h1>Local Images Map</h1>
  <div class="grid">
`;

for (const file of files) {
  html += `
    <div class="card">
      <img src="frontend/public/hhclaser_img/hhclaser_images/${file}" loading="lazy">
      <div class="filename">${file}</div>
    </div>
  `;
}

html += `
  </div>
</body>
</html>
`;

fs.writeFileSync('image_map_viewer.html', html);
console.log('Created image_map_viewer.html');
