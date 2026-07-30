const http = require('http');

http.get('http://localhost:3000/api/services?limit=5', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Status:', res.statusCode);
    console.log('Total services:', json.data?.total || json.data?.length || 'N/A');
    if (json.data?.services) {
      console.log('Sample services:');
      json.data.services.slice(0, 5).forEach(s => {
        console.log(` - ${s.name} | ${s.duration_minutes} min | JMD ${Number(s.price_jmd).toLocaleString()}`);
      });
    } else {
      console.log('Response:', JSON.stringify(json).substring(0, 500));
    }
  });
}).on('error', e => console.error('Error:', e.message));
