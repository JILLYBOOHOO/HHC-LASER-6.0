const http = require('http');

http.get('http://localhost:4200/hhclaser_img/hhclaser_images/Gallery%20image_42.webp', (res) => {
    console.log("Status code for Gallery image_42.webp:", res.statusCode);
}).on('error', (e) => {
    console.log("Error:", e.message);
});

http.get('http://localhost:4200/hhclaser_img/hhclaser_images/LASER%20HAIR%20REMOVAL.jpg', (res) => {
    console.log("Status code for LASER HAIR REMOVAL.jpg:", res.statusCode);
});
