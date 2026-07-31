const fs = require('fs');
const content = fs.readFileSync('C:\\\\Users\\\\jovau\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b13aa19f-d747-4604-924c-19f46b2df496\\\\.system_generated\\\\steps\\\\1030\\\\content.md', 'utf8');
const match = content.match(/data-page=\"(.*?)\"/);
if (match) {
  const data = JSON.parse(match[1].replace(/&quot;/g, '"'));
  console.log(JSON.stringify(data.props.categories[0], null, 2));
}
