const pool = require('../config/db.js');
const User = require('../models/userModel.js');

const findAll = async () => {
  const result = await pool.query('SELECT id, name, email FROM users ORDER BY id');
  return result.rows.map(row => new User(row));
};

const save = async (userData) => {
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [userData.name, userData.email]
  );
  return new User(result.rows[0]);
};

module.exports = { findAll, save };
