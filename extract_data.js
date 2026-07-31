const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\jovau\\.gemini\\antigravity-ide\\brain\\b13aa19f-d747-4604-924c-19f46b2df496\\.system_generated\\steps\\653\\content.md', 'utf-8');
const match = content.match(/data-page="([^"]+)"/);
if (match) {
    try {
        const decoded = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(decoded);
        fs.writeFileSync('C:\\Users\\jovau\\.gemini\\antigravity-ide\\brain\\b13aa19f-d747-4604-924c-19f46b2df496\\scratch\\live_data.json', JSON.stringify(data, null, 2));
        console.log('Successfully extracted live data to live_data.json');
    } catch (e) {
        console.error('Failed to parse JSON:', e);
    }
} else {
    console.log('No data-page attribute found.');
}
