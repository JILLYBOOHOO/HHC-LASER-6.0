const fs = require('fs');

const content = fs.readFileSync('frontend/src/app/features/public/services/services.component.ts', 'utf8');
const startStr = 'const treatments: Partial<Service>[] = [';
const start = content.indexOf(startStr);
const end = content.indexOf('];', start) + 2;

const treatments = content.substring(start, end);

fs.mkdirSync('frontend/src/app/core/data', { recursive: true });
fs.writeFileSync('frontend/src/app/core/data/services.data.ts', `import { Service } from '../models/models';\n\nexport ${treatments}\n`);

console.log('Extracted to services.data.ts');
