'use strict';

const crypto = require('crypto');
const config = require('../config');
const { ApiError } = require('./error');

const CSRF_COOKIE = 'jj_csrf';

/**
 * Issue (or reuse) a CSRF token in a readable cookie. The admin JS reads it
 * and echoes it back in the X-CSRF-Token header on every write request.
 */
function ensureCsrfCookie(req, res) {
  let token = req.cookies ? req.cookies[CSRF_COOKIE] : null;
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'strict',
      secure: config.COOKIE_SECURE,
      path: '/',
      maxAge: config.SESSION_TTL_MS
    });
  }
  return token;
}

/**
 * Verify the double-submit token on state-changing requests.
 * The header must match the cookie (and both must be present).
 */
function verifyCsrf(req, res, next) {
  const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE] : null;
  const headerToken = req.get('X-CSRF-Token');
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new ApiError(403, 'CSRF', 'رمز الحماية غير صالح، حدّث الصفحة وحاول مجدداً'));
  }
  next();
}

module.exports = { CSRF_COOKIE, ensureCsrfCookie, verifyCsrf };
