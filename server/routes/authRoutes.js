'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { loginSchema } = require('../schemas/settings.schema');
const { validateBody } = require('../middleware/validate');
const { issueSession, clearSession, isAuthenticated } = require('../middleware/auth');
const { ensureCsrfCookie } = require('../middleware/csrf');
const { ApiError } = require('../middleware/error');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      error: { code: 'RATE_LIMITED', message: 'محاولات كثيرة، حاول مرة أخرى بعد قليل' }
    });
  }
});

router.post('/login', loginLimiter, validateBody(loginSchema), (req, res, next) => {
  const ok = bcrypt.compareSync(req.validated.password, config.ADMIN_PASSWORD_HASH);
  if (!ok) {
    return next(new ApiError(401, 'BAD_CREDENTIALS', 'كلمة المرور غير صحيحة'));
  }
  issueSession(res);
  const csrfToken = ensureCsrfCookie(req, res);
  res.json({ ok: true, data: { authenticated: true, csrfToken } });
});

router.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true, data: { authenticated: false } });
});

router.get('/me', (req, res) => {
  const authed = isAuthenticated(req);
  const csrfToken = authed ? ensureCsrfCookie(req, res) : null;
  res.json({ ok: true, data: { authenticated: authed, csrfToken } });
});

module.exports = router;
