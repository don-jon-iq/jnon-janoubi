'use strict';

/**
 * Central environment configuration + validation.
 * Throws at startup if required secrets are missing so the server never
 * boots into an insecure state.
 */

const path = require('path');
const bcrypt = require('bcryptjs');

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `[config] Missing required environment variable: ${name}. ` +
      `Set it as a secret (see README) before starting the server.`
    );
  }
  return value.trim();
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// SESSION_SECRET is always required (used to sign the session JWT).
const SESSION_SECRET = required('SESSION_SECRET');

// Admin password: prefer a precomputed hash; otherwise hash the plaintext once now.
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
  ? process.env.ADMIN_PASSWORD_HASH.trim()
  : null;

if (!ADMIN_PASSWORD_HASH) {
  const plain = required('ADMIN_PASSWORD');
  ADMIN_PASSWORD_HASH = bcrypt.hashSync(plain, 12);
}

// COOKIE_SECURE defaults to true in production. Allow an explicit override
// (e.g. COOKIE_SECURE=false) so the cookie works over plain http on localhost.
let cookieSecure = isProd;
if (typeof process.env.COOKIE_SECURE === 'string') {
  cookieSecure = process.env.COOKIE_SECURE.trim().toLowerCase() === 'true';
}

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');

module.exports = Object.freeze({
  NODE_ENV,
  isProd,
  PORT: Number(process.env.PORT) || 8123,
  SESSION_SECRET,
  ADMIN_PASSWORD_HASH,
  COOKIE_SECURE: cookieSecure,
  SESSION_TTL: '2h',
  SESSION_TTL_MS: 2 * 60 * 60 * 1000,
  DATA_DIR,
  DB_PATH: path.join(DATA_DIR, 'store.db'),
  UPLOADS_DIR: path.join(DATA_DIR, 'uploads'),
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024,
  PROJECT_ROOT: path.join(__dirname, '..')
});
