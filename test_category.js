const fs = require('fs');

async function test() {
  const res = await fetch('https://hhclaser.com/services/11/body-contour');
  const text = await res.text();
  const match = text.match(/data-page="([^"]+)"/);
  if(match) {
    const dec = match[1].replace(/&quot;/g, '"');
    const d = JSON.parse(dec);
    console.log(Object.keys(d.props));
    if(d.props.category) console.log('Category keys:', Object.keys(d.props.category));
    if(d.props.category.services) console.log('Services in category?', d.props.category.services.length);
    if(d.props.treatments) console.log('Treatments?', d.props.treatments.length);
  }
}
test();
