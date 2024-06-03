const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Bitespeed',
  password: 'Admin',
  port: 5433,
});

module.exports = pool;
