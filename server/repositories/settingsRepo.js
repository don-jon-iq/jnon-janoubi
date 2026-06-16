'use strict';

const db = require('../db/connection');

const getAllStmt = db.prepare('SELECT key, value FROM settings');
const getStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
const upsertStmt = db.prepare(`
  INSERT INTO settings (key, value) VALUES (@key, @value)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);

function getAll() {
  const rows = getAllStmt.all();
  const out = {};
  rows.forEach((row) => { out[row.key] = row.value; });
  return out;
}

function get(key) {
  const row = getStmt.get(key);
  return row ? row.value : null;
}

function set(key, value) {
  upsertStmt.run({ key, value });
}

module.exports = { getAll, get, set };
