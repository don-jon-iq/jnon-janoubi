'use strict';

const config = require('../config');

/**
 * Small helper to build a consistent failure envelope.
 */
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function notFound(req, res) {
  res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'المسار غير موجود' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ ok: false, error: { code: err.code, message: err.message } });
  }

  // Multer / body-size errors
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'حجم الطلب كبير جداً' } });
  }
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ ok: false, error: { code: 'FILE_TOO_LARGE', message: 'حجم الصورة كبير جداً (الحد ٥ ميغابايت)' } });
  }

  if (!config.isProd) {
    // Surface details in development only.
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(500).json({ ok: false, error: { code: 'INTERNAL', message: 'حدث خطأ غير متوقع' } });
}

module.exports = { ApiError, errorHandler, notFound };
