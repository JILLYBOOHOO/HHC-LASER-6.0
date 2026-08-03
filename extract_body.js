const fs=require('fs'); 
const t=fs.readFileSync('hhc_body_contour.html', 'utf8'); 
const m=t.match(/data-page="([^"]+)"/); 
if(m) { 
  const d=JSON.parse(m[1].replace(/&quot;/g, '"')); 
  fs.writeFileSync('hhc_body_contour_data.json', JSON.stringify(d, null, 2)); 
}
