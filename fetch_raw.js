const https = require('https');
const fs = require('fs');

https.get('https://hhclaser.com/services/4/laser-hair-removal', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('C:\\Users\\Amber Student\\.gemini\\antigravity-ide\\brain\\288cbf76-8828-4061-91e8-8552b16011bc\\scratch\\live_category.html', data);
        const index = data.indexOf('Mid-Chest');
        if (index !== -1) {
            console.log("Found Mid-Chest in category HTML!");
        } else {
            console.log("Mid-Chest NOT found in category HTML.");
        }
    });
}).on('error', (err) => {
    console.log("Error: " + err.message);
});
