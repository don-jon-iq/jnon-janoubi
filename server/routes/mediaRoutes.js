'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const FileType = require('file-type');
const config = require('../config');
const mediaRepo = require('../repositories/mediaRepo');
const collectionsRepo = require('../repositories/collectionsRepo');
const itemsRepo = require('../repositories/itemsRepo');
const { verifyCsrf } = require('../middleware/csrf');
const { ApiError } = require('../middleware/error');

const router = express.Router();

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_UPLOAD_BYTES, files: 1 }
});

// GET /media — uploaded images + the committed assets/* images, for the picker.
router.get('/', (req, res) => {
  const uploads = mediaRepo.list().map((m) => ({
    id: m.id,
    path: m.path,
    mime: m.mime,
    size: m.size,
    source: 'upload'
  }));

  let assets = [];
  try {
    const assetsDir = path.join(config.PROJECT_ROOT, 'assets');
    assets = fs.readdirSync(assetsDir)
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .map((f) => ({ id: null, path: 'assets/' + f, source: 'asset' }));
  } catch (e) {
    assets = [];
  }

  res.json({ ok: true, data: { uploads, assets } });
});

// POST /media — upload a single image (validated by magic bytes).
router.post('/', verifyCsrf, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(422, 'NO_FILE', 'لم يتم اختيار صورة'));
    }
    const detected = await FileType.fromBuffer(req.file.buffer);
    if (!detected || !ALLOWED[detected.mime]) {
      return next(new ApiError(422, 'BAD_TYPE', 'صيغة الصورة غير مدعومة (JPG, PNG, WEBP, GIF فقط)'));
    }

    const ext = ALLOWED[detected.mime];
    const filename = `${crypto.randomUUID()}.${ext}`;
    fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(config.UPLOADS_DIR, filename), req.file.buffer);

    const record = mediaRepo.create({
      id: crypto.randomUUID(),
      filename,
      path: 'uploads/' + filename,
      mime: detected.mime,
      size: req.file.size
    });

    res.status(201).json({ ok: true, data: { id: record.id, path: record.path } });
  } catch (err) {
    next(err);
  }
});

// DELETE /media/:id — blocked if the image is still referenced.
router.delete('/:id', verifyCsrf, (req, res, next) => {
  const record = mediaRepo.getById(req.params.id);
  if (!record) {
    return next(new ApiError(404, 'NOT_FOUND', 'الصورة غير موجودة'));
  }
  const refs = collectionsRepo.countImageRefs(record.path) + itemsRepo.countImageRefs(record.path);
  if (refs > 0) {
    return next(new ApiError(409, 'IN_USE', 'الصورة مستخدمة في مجموعة أو قطعة، أزل الارتباط أولاً'));
  }

  try {
    fs.unlinkSync(path.join(config.UPLOADS_DIR, record.filename));
  } catch (e) {
    // File already gone — proceed to remove the record.
  }
  mediaRepo.remove(req.params.id);
  res.json({ ok: true, data: { deleted: true } });
});

module.exports = router;
