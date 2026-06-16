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

const createCollectionSchema = z.object({
  id: z.string().trim().regex(SLUG, 'المعرّف يجب أن يكون أحرفاً إنجليزية صغيرة وأرقاماً وشرطات'),
  name: z.string().trim().min(1, 'اسم المجموعة مطلوب').max(120),
  tag: z.string().trim().max(60).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  image: imageField,
  available: z.boolean().default(true)
});

const updateCollectionSchema = createCollectionSchema.omit({ id: true });

const reorderSchema = z.object({
  order: z.array(z.string().regex(SLUG)).min(1, 'قائمة الترتيب مطلوبة')
});

module.exports = { createCollectionSchema, updateCollectionSchema, reorderSchema };
