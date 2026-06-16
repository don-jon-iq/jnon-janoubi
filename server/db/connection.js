'use strict';

/**
 * Singleton better-sqlite3 connection with sensible pragmas.
 * WAL mode allows concurrent public reads alongside admin writes.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// Ensure the data directory exists before opening the DB file.
fs.mkdirSync(config.DATA_DIR, { recursive: true });

const db = new Database(config.DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Apply the schema immediately on connect (idempotent — CREATE ... IF NOT
// EXISTS). This guarantees every table exists before any repository module
// prepares a statement at load time, regardless of require() order.
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

module.exports = db;
