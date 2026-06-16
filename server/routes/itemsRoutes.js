'use strict';

const express = require('express');
const collectionsRepo = require('../repositories/collectionsRepo');
const itemsRepo = require('../repositories/itemsRepo');
const { validateBody } = require('../middleware/validate');
const { verifyCsrf } = require('../middleware/csrf');
const { ApiError } = require('../middleware/error');
const { createItemSchema, updateItemSchema, reorderSchema } = require('../schemas/item.schema');

// mergeParams so :cid (collection id) from the parent path is available.
const router = express.Router({ mergeParams: true });

function serialize(it) {
  return {
    id: it.id,
    collection_id: it.collection_id,
    name: it.name,
    description: it.description,
    price: it.price,
    image: it.image,
    sort_order: it.sort_order
  };
}

// Ensure the parent collection exists for every route here.
router.use((req, res, next) => {
  if (!collectionsRepo.getById(req.params.cid)) {
    return next(new ApiError(404, 'NOT_FOUND', 'المجموعة غير موجودة'));
  }
  next();
});

router.get('/', (req, res) => {
  const data = itemsRepo.listByCollection(req.params.cid).map(serialize);
  res.json({ ok: true, data });
});

router.put('/reorder', verifyCsrf, validateBody(reorderSchema), (req, res) => {
  itemsRepo.reorder(req.validated.order);
  res.json({ ok: true, data: { reordered: true } });
});

router.post('/', verifyCsrf, validateBody(createItemSchema), (req, res, next) => {
  if (itemsRepo.getById(req.validated.id)) {
    return next(new ApiError(409, 'CONFLICT', 'يوجد قطعة بنفس المعرّف'));
  }
  const created = itemsRepo.create(req.params.cid, req.validated);
  res.status(201).json({ ok: true, data: serialize(created) });
});

router.put('/:id', verifyCsrf, validateBody(updateItemSchema), (req, res, next) => {
  const existing = itemsRepo.getById(req.params.id);
  if (!existing || existing.collection_id !== req.params.cid) {
    return next(new ApiError(404, 'NOT_FOUND', 'القطعة غير موجودة'));
  }
  const updated = itemsRepo.update(req.params.id, req.validated);
  res.json({ ok: true, data: serialize(updated) });
});

router.delete('/:id', verifyCsrf, (req, res, next) => {
  const existing = itemsRepo.getById(req.params.id);
  if (!existing || existing.collection_id !== req.params.cid) {
    return next(new ApiError(404, 'NOT_FOUND', 'القطعة غير موجودة'));
  }
  itemsRepo.remove(req.params.id);
  res.json({ ok: true, data: { deleted: true } });
});

module.exports = router;
