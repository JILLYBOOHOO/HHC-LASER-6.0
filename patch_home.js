const fs = require('fs');

const file = 'frontend/src/app/features/public/home/home.component.ts';
let content = fs.readFileSync(file, 'utf8');

const importStr = "import { SeoService } from '../../../core/services/seo.service';\nimport { treatments } from '../../../core/data/services.data';\n";
content = content.replace("import { SeoService } from '../../../core/services/seo.service';\n", importStr);

const originalApiCall = `    this.api.getServices(undefined, true).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.featuredServices.set(res.data.slice(0, 6)); // Curated limit to 6 premium services
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });`;

const newApiCall = `    this.api.getServices(undefined, true).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.featuredServices.set(res.data.slice(0, 6)); // Curated limit to 6 premium services
        } else {
          // Fallback to static data if API is empty
          this.featuredServices.set((treatments as Service[]).slice(0, 6));
        }
        this.loading.set(false);
      },
      error: () => {
        // Fallback to static data on error
        this.featuredServices.set((treatments as Service[]).slice(0, 6));
        this.loading.set(false);
      }
    });`;

content = content.replace(originalApiCall, newApiCall);
fs.writeFileSync(file, content);
console.log('home.component.ts patched');
