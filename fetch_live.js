const https = require('https');
const fs = require('fs');

https.get('https://hhclaser.com/services/4/laser-hair-removal', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const match = data.match(/data-page="([^"]+)"/);
        if (match) {
            let jsonStr = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            fs.writeFileSync('C:\\Users\\Amber Student\\.gemini\\antigravity-ide\\brain\\288cbf76-8828-4061-91e8-8552b16011bc\\scratch\\live_laser.json', jsonStr);
            console.log("Extracted page data!");
        } else {
            console.log("No data-page found.");
        }
    });
}).on('error', (err) => {
    console.log("Error: " + err.message);
});
