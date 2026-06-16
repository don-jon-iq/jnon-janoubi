/* =====================================================
   جنون جنوبي — config.js
   Loads the store catalog from the backend API and exposes it as the
   global STORE_CONFIG (same shape the rest of the site expects).

   ⚙️ لتعديل المنتجات والأسعار ورقم الواتساب: استخدم لوحة التحكم على /admin
   ===================================================== */

'use strict';

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }
  return value;
}

/**
 * Fetch the store config from the API and publish it as window.STORE_CONFIG.
 * Returns the config object. Throws on network/HTTP error so the boot
 * sequence can show an error state.
 */
async function loadStoreConfig() {
  var res = await fetch('/api/store', { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error('store request failed: ' + res.status);
  }
  var body = await res.json();
  if (!body || !body.ok || !body.data) {
    throw new Error('store response malformed');
  }
  window.STORE_CONFIG = deepFreeze(body.data);
  return window.STORE_CONFIG;
}

window.loadStoreConfig = loadStoreConfig;
