const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Amber Student\\.gemini\\antigravity-ide\\brain\\288cbf76-8828-4061-91e8-8552b16011bc\\scratch\\live_bookings.html', 'utf8');

const match = content.match(/data-page="([^"]+)"/);
if (match) {
    let jsonStr = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    const data = JSON.parse(jsonStr);
    const routes = data.props.ziggy.routes;
    console.log("Available routes:");
    for (const [key, value] of Object.entries(routes)) {
        if (value.uri.includes('api') || value.uri.includes('service') || value.uri.includes('treatment')) {
            console.log(key + ": " + value.uri);
        }
    }
}
