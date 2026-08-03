const fs = require('fs');
const servicesPath = './frontend/src/app/features/public/services/services.component.ts';
const liveDir = './frontend/public/hhclaser_img/hhclaser_images/live';
const liveFiles = fs.readdirSync(liveDir);

let content = fs.readFileSync(servicesPath, 'utf8');

const regex = /const treatments: Partial<Service>\[\] = \[\r?\n([\s\S]*?)\r?\n    \];/;
const treatmentsMatch = content.match(regex);

if (treatmentsMatch) {
    const lines = treatmentsMatch[1].split(/\r?\n/);
    const newLines = lines.map(line => {
        const idMatch = line.match(/id: (\d+)/);
        if (idMatch) {
            const id = idMatch[1];
            const file = liveFiles.find(f => f.startsWith(id + '_'));
            if (file) {
                const newUrl = `/hhclaser_img/hhclaser_images/live/${file}`;
                return line.replace(/thumbnail_url: '[^']*'/, `thumbnail_url: '${newUrl}'`);
            }
        }
        return line;
    });
    content = content.replace(treatmentsMatch[1], newLines.join('\n'));
    fs.writeFileSync(servicesPath, content);
    console.log('Updated services.component.ts');
} else {
    console.log('Could not find treatments array');
}
