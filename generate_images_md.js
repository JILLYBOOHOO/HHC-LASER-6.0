const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'frontend', 'public', 'hhclaser_img', 'hhclaser_images');
const mdPath = path.join('C:', 'Users', 'Amber Student', '.gemini', 'antigravity-ide', 'brain', '288cbf76-8828-4061-91e8-8552b16011bc', 'scratch', 'images_list.md');

let mdContent = "# Images List\n\n";
const files = fs.readdirSync(imageDir);

for (const file of files) {
  if (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')) {
    const filePath = path.join(imageDir, file).replace(/\\/g, '/');
    mdContent += `## ${file}\n`;
    mdContent += `![${file}](file:///${filePath})\n\n`;
  }
}

fs.writeFileSync(mdPath, mdContent);
console.log('Markdown created at:', mdPath);
