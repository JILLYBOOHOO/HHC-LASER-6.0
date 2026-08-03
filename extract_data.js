const fs=require('fs'); 
const t=fs.readFileSync('hhc_treatments.html', 'utf8'); 
const m=t.match(/data-page="([^"]+)"/); 
if(m){ 
  const d=JSON.parse(m[1].replace(/&quot;/g, '"')); 
  fs.writeFileSync('hhc_data.json', JSON.stringify(d, null, 2)); 
  console.log('Extracted hhc_data.json'); 
} else { 
  console.log('no data-page found'); 
}
