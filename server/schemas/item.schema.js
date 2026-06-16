'use strict';

const { z } = require('zod');

const SLUG = /^[a-z0-9-]{1,64}$/;
const IMAGE_PATH = /^(assets|uploads)\/[\w.\-/]+$/;

const imageField = z
  .string()
  .trim()
  .regex(IMAGE_PATH, 'مسار الصورة غير صالح')
  .optional()
  .or(z.literal('').transform(() => undefined))
  .nullable();

const createItemSchema = z.object({
  id: z.string().trim().regex(SLUG, 'المعرّف يجب أن يكون أحرفاً إنجليزية صغيرة وأرقاماً وشرطات'),
  name: z.string().trim().min(1, 'اسم القطعة مطلوب').max(120),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.number({ invalid_type_error: 'السعر يجب أن يكون رقماً' }).int('السعر يجب أن يكون رقماً صحيحاً').nonnegative('السعر لا يمكن أن يكون سالباً'),
  image: imageField
});

const updateItemSchema = createItemSchema.omit({ id: true });

const reorderSchema = z.object({
  order: z.array(z.string().regex(SLUG)).min(1, 'قائمة الترتيب مطلوبة')
});

module.exports = { createItemSchema, updateItemSchema, reorderSchema };
