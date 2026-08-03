const fs = require('fs');
const file = 'frontend/src/app/features/public/services/services.component.ts';
let content = fs.readFileSync(file, 'utf8');

const importStr = "import { SeoService } from '../../../core/services/seo.service';\nimport { treatments } from '../../../core/data/services.data';\n";
content = content.replace("import { SeoService } from '../../../core/services/seo.service';\n", importStr);

const startStr = 'const treatments: Partial<Service>[] = [';
const start = content.indexOf(startStr);
const end = content.indexOf('];', start) + 2;

const arrayContent = content.substring(start, end);
content = content.replace(arrayContent, '');

fs.writeFileSync(file, content);
console.log('services.component.ts patched to use services.data.ts');
