'use strict';

const { ApiError } = require('./error');

/**
 * Validate req.body against a zod schema. On failure returns a 422 with the
 * first issue message (Arabic-friendly messages come from the schemas).
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.issues[0];
      const message = first ? first.message : 'بيانات غير صحيحة';
      return next(new ApiError(422, 'VALIDATION', message));
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validateBody };
