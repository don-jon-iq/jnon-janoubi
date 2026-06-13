/* =====================================================
   جنون جنوبي — order.js
   Form validation + WhatsApp order message
   ===================================================== */

'use strict';

var Order = (function () {

  // Iraqi mobile numbers: 07 + 9 digits (also accepts +964 / 964 prefix)
  var PHONE_RE = /^(\+?964|0)7[0-9]{9}$/;

  var FIELDS = [
    { id: 'custName',    label: 'الاسم',    validate: validateName },
    { id: 'custPhone',   label: 'الهاتف',   validate: validatePhone },
    { id: 'custCity',    label: 'المحافظة', validate: validateRequired },
    { id: 'custAddress', label: 'العنوان',  validate: validateAddress }
  ];

  function normalizeDigits(value) {
    // Convert Arabic-Indic digits (٠١٢...) to Latin so validation passes
    return value.replace(/[٠-٩]/g, function (d) {
      return String(d.charCodeAt(0) - 0x0660);
    }).replace(/[\s\-()]/g, '');
  }

  function validateName(value) {
    if (!value.trim()) { return 'نحتاج اسمك حتى نوصل الطلب'; }
    if (value.trim().length < 3) { return 'الاسم قصير جداً'; }
    return '';
  }

  function validatePhone(value) {
    var clean = normalizeDigits(value);
    if (!clean) { return 'رقم الهاتف مطلوب للتواصل معك'; }
    if (!PHONE_RE.test(clean)) { return 'اكتب رقماً عراقياً صحيحاً يبدأ بـ 07'; }
    return '';
  }

  function validateRequired(value) {
    return value.trim() ? '' : 'هذا الحقل مطلوب';
  }

  function validateAddress(value) {
    if (!value.trim()) { return 'العنوان مطلوب حتى يوصلك المندوب'; }
    if (value.trim().length < 5) { return 'اكتب العنوان بتفصيل أكثر'; }
    return '';
  }

  function showFieldError(id, message) {
    var input = document.getElementById(id);
    var errorEl = document.querySelector('[data-error-for="' + id + '"]');
    if (input) { input.closest('.field').classList.toggle('has-error', Boolean(message)); }
    if (errorEl) { errorEl.textContent = message; }
  }

  function validateForm() {
    var values = {};
    var valid = true;

    FIELDS.forEach(function (field) {
      var input = document.getElementById(field.id);
      var value = input ? input.value : '';
      var error = field.validate(value);
      showFieldError(field.id, error);
      if (error) { valid = false; }
      values[field.id] = value.trim();
    });

    var notes = document.getElementById('custNotes');
    values.custNotes = notes ? notes.value.trim() : '';
    return { valid: valid, values: values };
  }

  function buildMessage(values) {
    var collection = Wizard.getCollection();
    var lines = [];

    lines.push('السلام عليكم، أريد أطلب من جنون جنوبي:');
    lines.push('');
    lines.push('المجموعة: ' + (collection ? collection.name : ''));
    lines.push('');
    lines.push('القطع:');
    Wizard.getPickedItems().forEach(function (entry) {
      lines.push('- ' + entry.item.name + ' × ' + entry.qty +
        ' = ' + Wizard.formatPrice(entry.item.price * entry.qty));
    });
    lines.push('');
    lines.push('المجموع: ' + Wizard.formatPrice(Wizard.getTotal()));
    lines.push('');
    lines.push('الاسم: ' + values.custName);
    lines.push('الهاتف: ' + normalizeDigits(values.custPhone));
    lines.push('المحافظة: ' + values.custCity);
    lines.push('العنوان: ' + values.custAddress);
    if (values.custNotes) {
      lines.push('ملاحظات: ' + values.custNotes);
    }

    return lines.join('\n');
  }

  function send() {
    var result = validateForm();
    if (!result.valid) {
      var firstError = document.querySelector('.field.has-error input, .field.has-error select');
      if (firstError) { firstError.focus(); }
      return;
    }

    if (Wizard.getPickedItems().length === 0) {
      Wizard.goTo(2);
      return;
    }

    var number = STORE_CONFIG.WHATSAPP_NUMBER;
    if (!/^\d{10,15}$/.test(number)) {
      window.alert('ملاحظة لصاحب المتجر: ضع رقم واتساب المتجر في ملف js/config.js قبل النشر.');
      return;
    }

    var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(buildMessage(result.values));
    window.open(url, '_blank', 'noopener');
    Wizard.goTo(4);
  }

  function init() {
    var sendBtn = document.getElementById('sendOrder');
    if (sendBtn) { sendBtn.addEventListener('click', send); }

    // Clear a field's error as soon as the user fixes it
    FIELDS.forEach(function (field) {
      var input = document.getElementById(field.id);
      if (!input) { return; }
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) {
          showFieldError(field.id, field.validate(input.value));
        }
      });
    });
  }

  return { init: init };

})();
