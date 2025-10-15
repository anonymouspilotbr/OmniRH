const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'OmniRH',
    password: 'uemeeli',
    port: 5432
});

module.exports = pool;