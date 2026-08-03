const fs = require('fs');
const content = fs.readFileSync('C:/Users/jovau/.gemini/antigravity-ide/brain/0e35ee50-5b9d-4487-8f22-e6754231da96/.system_generated/steps/307/content.md', 'utf8');
const match = content.match(/data-page="([^"]+)"/);
if (match) {
    const dataPage = match[1].replace(/&quot;/g, '"');
    try {
        const json = JSON.parse(dataPage);
        fs.writeFileSync('live_services2.json', JSON.stringify(json.props, null, 2));
        console.log('Saved to live_services2.json');
    } catch (e) {
        console.error('Error parsing JSON:', e);
    }
} else {
    console.log('data-page not found');
}
