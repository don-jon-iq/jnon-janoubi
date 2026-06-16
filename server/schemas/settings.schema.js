'use strict';

const { z } = require('zod');

const settingsSchema = z.object({
  WHATSAPP_NUMBER: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, 'رقم الواتساب يجب أن يكون بالصيغة الدولية بدون + (مثال: 9647801234567)'),
  CURRENCY: z.string().trim().min(1, 'رمز العملة مطلوب').max(12)
});

const loginSchema = z.object({
  password: z.string().min(1, 'كلمة المرور مطلوبة').max(200)
});

module.exports = { settingsSchema, loginSchema };
