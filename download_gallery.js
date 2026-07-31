const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/74246b64-b502-400b-af72-b95d4e0d258a.webp',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/5qzALGcTtqjzuR1lKaok3YvSPTFzqwrG1PkNkI0c.jpg',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/c58009fc-0907-4a6c-a729-b9094b0adfef.webp',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/LWadxSERmiAef2aIPOicJOMO9w6BPVdAH0norOAl.jpg',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/9YE0edkU5jy9nYqT6gC2Z69rCySZMsPBmmupRqeq.png',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/17aaa7c5-2138-48f8-9347-407aed88ccbd.webp',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/RLiR9Ud47eAfApSDFrlrtfUHuSFWv3kmlWiD7Ptf.jpg',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/Vylcp7Sg064vK1ZojQlcSeddxMBfduqIckFkDvsy.jpg',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/nVUnZ90fttcPplxk4cPNSHAJFD1KqzaJRovcSjvJ.jpg',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/WxFThUfSy7nuVZIBYzfdT1VbBNVSicDwUfv0vjiO.webp',
  'https://hhclaserco.sfo3.digitaloceanspaces.com/gallery/NoyyMek7YmuNeJnuU2sbJRmVBOcYDEugAQKpGVlg.jpg'
];

const dir = path.join(__dirname, 'frontend', 'public', 'images', 'live_gallery');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const ext = url.split('.').pop();
    const dest = path.join(dir, `gallery_${i + 1}.${ext}`);
    console.log(`Downloading ${url} to ${dest}...`);
    try {
      await download(url, dest);
    } catch (e) {
      console.error(`Failed to download ${url}:`, e);
    }
  }
  console.log('Finished downloading images.');
}

run();
