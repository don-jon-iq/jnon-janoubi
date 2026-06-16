'use strict';

const express = require('express');
const storeService = require('../services/storeService');

const router = express.Router();

// Public storefront data — the only endpoint the public site calls.
router.get('/store', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({ ok: true, data: storeService.assembleStore() });
});

module.exports = router;
