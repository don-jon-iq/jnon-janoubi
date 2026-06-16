/* AdminUI — modal, toast, and confirm helpers shared across admin modules */
'use strict';

var AdminUI = (function () {

  var root = null;
  var titleEl = null;
  var bodyEl = null;
  var toastEl = null;
  var toastTimer = null;

  function init() {
    root = document.getElementById('modalRoot');
    titleEl = document.getElementById('modalTitle');
    bodyEl = document.getElementById('modalBody');
    toastEl = document.getElementById('toast');

    root.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !root.hidden) { close(); }
    });
  }

  /** Open a modal with a title and a DOM node body. */
  function modal(title, contentNode) {
    titleEl.textContent = title;
    bodyEl.innerHTML = '';
    bodyEl.appendChild(contentNode);
    root.hidden = false;
    var firstInput = bodyEl.querySelector('input, textarea, select, button');
    if (firstInput) { firstInput.focus(); }
  }

  function close() {
    root.hidden = true;
    bodyEl.innerHTML = '';
  }

  function toast(message, type) {
    toastEl.textContent = message;
    toastEl.className = 'toast' + (type ? ' toast-' + type : '');
    toastEl.hidden = false;
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  /** Promise-based confirm rendered as a modal. */
  function confirm(message, confirmLabel) {
    return new Promise(function (resolve) {
      var wrap = document.createElement('div');
      wrap.className = 'confirm';
      wrap.innerHTML =
        '<p class="confirm-msg"></p>' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-act="cancel">إلغاء</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-act="ok"></button>' +
        '</div>';
      wrap.querySelector('.confirm-msg').textContent = message;
      wrap.querySelector('[data-act="ok"]').textContent = confirmLabel || 'تأكيد';
      wrap.querySelector('[data-act="cancel"]').addEventListener('click', function () { close(); resolve(false); });
      wrap.querySelector('[data-act="ok"]').addEventListener('click', function () { close(); resolve(true); });
      modal('تأكيد', wrap);
    });
  }

  return { init: init, modal: modal, close: close, toast: toast, confirm: confirm };

})();
