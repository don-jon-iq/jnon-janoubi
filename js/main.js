/* =====================================================
   جنون جنوبي — main.js
   Boot sequence: load store data from the API, then start the wizard.
   ===================================================== */

'use strict';

(function () {

  function byId(id) { return document.getElementById(id); }

  function setBoot(html) {
    var wizard = byId('wizard');
    var status = byId('bootStatus');
    if (!status) {
      status = document.createElement('div');
      status.id = 'bootStatus';
      status.className = 'boot-status';
      wizard.parentNode.insertBefore(status, wizard);
    }
    status.innerHTML = html;
  }

  function clearBoot() {
    var status = byId('bootStatus');
    if (status) { status.parentNode.removeChild(status); }
  }

  function showLoading() {
    byId('wizard').style.display = 'none';
    setBoot('<span class="boot-spinner" aria-hidden="true"></span><p class="boot-msg">يتم تحميل المنتجات…</p>');
  }

  function showError() {
    byId('wizard').style.display = 'none';
    setBoot(
      '<p class="boot-msg">تعذّر تحميل المنتجات. تحقق من اتصالك وحاول مجدداً.</p>' +
      '<button type="button" class="btn btn-primary" id="bootRetry">إعادة المحاولة</button>'
    );
    var retry = byId('bootRetry');
    if (retry) { retry.addEventListener('click', boot); }
  }

  function showEmpty() {
    byId('wizard').style.display = 'none';
    setBoot('<p class="boot-msg">لا توجد مجموعات متاحة حالياً، تابعنا قريباً.</p>');
  }

  async function boot() {
    showLoading();
    try {
      var cfg = await window.loadStoreConfig();
      if (!cfg.COLLECTIONS || cfg.COLLECTIONS.length === 0) {
        showEmpty();
        return;
      }
      clearBoot();
      byId('wizard').style.display = '';
      Wizard.init();
      Order.init();
    } catch (e) {
      showError();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Animations.init();
    boot();
  });

})();
