'use strict';

const express = require('express');
const settingsRepo = require('../repositories/settingsRepo');
const { validateBody } = require('../middleware/validate');
const { verifyCsrf } = require('../middleware/csrf');
const { settingsSchema } = require('../schemas/settings.schema');

const router = express.Router();

router.get('/', (req, res) => {
  const all = settingsRepo.getAll();
  res.json({
    ok: true,
    data: {
      WHATSAPP_NUMBER: all.WHATSAPP_NUMBER || '',
      CURRENCY: all.CURRENCY || 'د.ع'
    }
  });
});

router.put('/', verifyCsrf, validateBody(settingsSchema), (req, res) => {
  settingsRepo.set('WHATSAPP_NUMBER', req.validated.WHATSAPP_NUMBER);
  settingsRepo.set('CURRENCY', req.validated.CURRENCY);
  res.json({ ok: true, data: req.validated });
});

module.exports = router;
