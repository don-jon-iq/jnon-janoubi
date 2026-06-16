/* Settings — load and save store settings (WhatsApp number, currency) */
'use strict';

var Settings = (function () {

  var form, whatsapp, currency;

  function fieldError(id, msg) {
    var el = document.querySelector('[data-error-for="' + id + '"]');
    if (el) { el.textContent = msg || ''; }
  }

  async function load() {
    try {
      var data = await AdminApi.get('/api/admin/settings');
      whatsapp.value = data.WHATSAPP_NUMBER || '';
      currency.value = data.CURRENCY || '';
    } catch (e) {
      AdminUI.toast('تعذّر تحميل الإعدادات', 'error');
    }
  }

  function normalizeDigits(value) {
    return value.replace(/[٠-٩]/g, function (d) {
      return String(d.charCodeAt(0) - 0x0660);
    }).replace(/[\s\-+()]/g, '');
  }

  async function save(e) {
    e.preventDefault();
    fieldError('setWhatsapp', '');
    fieldError('setCurrency', '');

    var number = normalizeDigits(whatsapp.value);
    var payload = { WHATSAPP_NUMBER: number, CURRENCY: currency.value.trim() };
    try {
      await AdminApi.put('/api/admin/settings', payload);
      whatsapp.value = number;
      AdminUI.toast('تم حفظ الإعدادات', 'ok');
    } catch (err) {
      if (err.code === 'VALIDATION' && /واتساب/.test(err.message)) {
        fieldError('setWhatsapp', err.message);
      } else {
        AdminUI.toast(err.message, 'error');
      }
    }
  }

  function init() {
    form = document.getElementById('settingsForm');
    whatsapp = document.getElementById('setWhatsapp');
    currency = document.getElementById('setCurrency');
    form.addEventListener('submit', save);
  }

  return { init: init, load: load };

})();
