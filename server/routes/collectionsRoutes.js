'use strict';

const express = require('express');
const collectionsRepo = require('../repositories/collectionsRepo');
const itemsRepo = require('../repositories/itemsRepo');
const { validateBody } = require('../middleware/validate');
const { verifyCsrf } = require('../middleware/csrf');
const { ApiError } = require('../middleware/error');
const {
  createCollectionSchema,
  updateCollectionSchema,
  reorderSchema
} = require('../schemas/collection.schema');

const router = express.Router();

function serialize(c) {
  return {
    id: c.id,
    name: c.name,
    tag: c.tag,
    description: c.description,
    image: c.image,
    available: c.available === 1,
    sort_order: c.sort_order
  };
}

// List all collections (admin view — includes unavailable + item counts).
router.get('/', (req, res) => {
  const data = collectionsRepo.list().map((c) => ({
    ...serialize(c),
    itemCount: itemsRepo.listByCollection(c.id).length
  }));
  res.json({ ok: true, data });
});

// Reorder — must be declared before '/:id' so it isn't captured as an id.
router.put('/reorder', verifyCsrf, validateBody(reorderSchema), (req, res) => {
  collectionsRepo.reorder(req.validated.order);
  res.json({ ok: true, data: { reordered: true } });
});

router.get('/:id', (req, res, next) => {
  const c = collectionsRepo.getById(req.params.id);
  if (!c) return next(new ApiError(404, 'NOT_FOUND', 'المجموعة غير موجودة'));
  res.json({ ok: true, data: serialize(c) });
});

router.post('/', verifyCsrf, validateBody(createCollectionSchema), (req, res, next) => {
  if (collectionsRepo.getById(req.validated.id)) {
    return next(new ApiError(409, 'CONFLICT', 'يوجد مجموعة بنفس المعرّف'));
  }
  const created = collectionsRepo.create(req.validated);
  res.status(201).json({ ok: true, data: serialize(created) });
});

router.put('/:id', verifyCsrf, validateBody(updateCollectionSchema), (req, res, next) => {
  if (!collectionsRepo.getById(req.params.id)) {
    return next(new ApiError(404, 'NOT_FOUND', 'المجموعة غير موجودة'));
  }
  const updated = collectionsRepo.update(req.params.id, req.validated);
  res.json({ ok: true, data: serialize(updated) });
});

router.delete('/:id', verifyCsrf, (req, res, next) => {
  if (!collectionsRepo.getById(req.params.id)) {
    return next(new ApiError(404, 'NOT_FOUND', 'المجموعة غير موجودة'));
  }
  collectionsRepo.remove(req.params.id); // items cascade-delete via FK
  res.json({ ok: true, data: { deleted: true } });
});

module.exports = router;
