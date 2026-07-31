const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\jovau\\.gemini\\antigravity-ide\\brain\\b13aa19f-d747-4604-924c-19f46b2df496\\.system_generated\\steps\\653\\content.md', 'utf-8');
const urls = [...new Set([...content.matchAll(/https?:\/\/[^\s\"\'\\]+\.(?:jpg|jpeg|png|webp)/g)].map(m => m[0]))];
console.log('Found images:', urls);
