const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Amber Student\\.gemini\\antigravity-ide\\brain\\288cbf76-8828-4061-91e8-8552b16011bc\\.system_generated\\steps\\1098\\content.md', 'utf8');

const index = content.indexOf('Mid-Chest');
if (index !== -1) {
    console.log("Found Mid-Chest!");
    console.log(content.substring(index - 100, index + 200));
} else {
    console.log("Mid-Chest not found in content.md");
}
