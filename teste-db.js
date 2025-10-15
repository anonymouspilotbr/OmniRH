const pool = require('./src/config/db.js');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  } finally {
    pool.end();
  }
})();