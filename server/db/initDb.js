'use strict';

const fs = require('fs');
const path = require('path');
const db = require('./connection');

/**
 * Apply the schema (idempotent — every statement is CREATE ... IF NOT EXISTS).
 */
function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
}

module.exports = initDb;
