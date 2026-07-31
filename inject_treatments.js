const fs = require('fs');
const tsPath = 'frontend/src/app/features/public/services/services.component.ts';
let content = fs.readFileSync(tsPath, 'utf8');
const newTreatments = fs.readFileSync('new_treatments.js', 'utf8');

const regex = /const treatments: Partial<Service>\[\] = \[\s*[\s\S]*?\s*\];/;
if (regex.test(content)) {
    content = content.replace(regex, newTreatments.trim());
    fs.writeFileSync(tsPath, content);
    console.log('Successfully updated services.component.ts');
} else {
    console.error('Could not find the treatments array in services.component.ts');
}
