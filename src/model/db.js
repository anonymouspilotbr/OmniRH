const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_9p5BFyRYXMfW@ep-tiny-hall-acx7j26v-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

module.exports = pool;