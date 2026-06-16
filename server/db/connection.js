'use strict';

/**
 * Singleton better-sqlite3 connection with sensible pragmas.
 * WAL mode allows concurrent public reads alongside admin writes.
 */

const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config');

// Ensure the data directory exists before opening the DB file.
fs.mkdirSync(config.DATA_DIR, { recursive: true });

const db = new Database(config.DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
