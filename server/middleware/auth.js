'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { ApiError } = require('./error');

const SESSION_COOKIE = 'jj_session';

function issueSession(res) {
  const token = jwt.sign({ sub: 'admin' }, config.SESSION_SECRET, { expiresIn: config.SESSION_TTL });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.COOKIE_SECURE,
    path: '/',
    maxAge: config.SESSION_TTL_MS
  });
}

function clearSession(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.COOKIE_SECURE,
    path: '/'
  });
}

function isAuthenticated(req) {
  const token = req.cookies ? req.cookies[SESSION_COOKIE] : null;
  if (!token) return false;
  try {
    jwt.verify(token, config.SESSION_SECRET);
    return true;
  } catch (e) {
    return false;
  }
}

function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'الرجاء تسجيل الدخول'));
  }
  next();
}

module.exports = { SESSION_COOKIE, issueSession, clearSession, isAuthenticated, requireAuth };
