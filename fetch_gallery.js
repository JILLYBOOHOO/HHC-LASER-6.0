const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const url = 'https://hhclaser.com/gallery';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Basic regex to find img src attributes
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    const images = new Set();
    while ((match = imgRegex.exec(data)) !== null) {
      if (!match[1].startsWith('data:')) {
        let src = match[1];
        if (src.startsWith('/')) {
            src = 'https://hhclaser.com' + src;
        } else if (!src.startsWith('http')) {
            src = 'https://hhclaser.com/' + src;
        }
        if(!src.toLowerCase().includes('logo') && !src.toLowerCase().includes('visa') && !src.toLowerCase().includes('mastercard') && !src.toLowerCase().includes('icon')) {
            images.add(src);
        }
      }
    }
    
    const targetDir = path.join(__dirname, 'frontend', 'public', 'gallery');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let i = 1;
    images.forEach(imgUrl => {
      let ext = imgUrl.split('.').pop().split('?')[0];
      if (ext.length > 4 || ext.includes('/')) ext = 'jpg';
      const filePath = path.join(targetDir, `gallery_${i}.${ext}`);
      console.log(`Downloading ${imgUrl} to ${filePath}`);
      
      const file = fs.createWriteStream(filePath);
      const requestModule = imgUrl.startsWith('https') ? https : http;
      requestModule.get(imgUrl, function(response) {
        response.pipe(file);
      });
      i++;
    });
  });
}).on('error', err => {
  console.error('Error fetching URL:', err.message);
});
