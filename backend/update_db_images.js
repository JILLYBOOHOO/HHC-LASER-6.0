require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const dataPath = '../frontend/src/app/core/data/services.data.ts';
let raw = fs.readFileSync(dataPath, 'utf8');
raw = raw.substring(raw.indexOf('['));
raw = raw.replace(/export /g, '');
const services = eval(raw);

(async () => {
    try {
        for (const s of services) {
            if (s.thumbnail_url) {
                await pool.query('UPDATE services SET thumbnail_url = $1 WHERE id = $2', [s.thumbnail_url, s.id]);
                console.log('Updated service ' + s.id + ' with ' + s.thumbnail_url);
            }
        }
        console.log('Done updating DB images');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
