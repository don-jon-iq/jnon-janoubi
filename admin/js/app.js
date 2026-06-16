/* app — boot: check session, route to login or dashboard, wire tabs/logout */
'use strict';

(function () {

  var loginView, dashView, loginForm, loginError, pw, started = false;

  function show(view) {
    loginView.hidden = view !== 'login';
    dashView.hidden = view !== 'dash';
  }

  function startDashboard() {
    if (!started) {
      Collections.init();
      Items.init();
      Settings.init();
      started = true;
    }
    show('dash');
    Collections.load();
    Settings.load();
  }

  function setupTabs() {
    var tabs = document.getElementById('tabs');
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (!btn) { return; }
      var name = btn.getAttribute('data-tab');
      tabs.querySelectorAll('.tab').forEach(function (t) {
        t.classList.toggle('is-active', t === btn);
      });
      document.querySelectorAll('.admin-panel').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === name);
      });
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    loginError.textContent = '';
    var btn = document.getElementById('loginBtn');
    btn.disabled = true;
    try {
      var ok = await Auth.login(pw.value);
      if (ok) {
        pw.value = '';
        startDashboard();
      } else {
        loginError.textContent = 'كلمة المرور غير صحيحة';
      }
    } catch (err) {
      loginError.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  }

  async function boot() {
    AdminUI.init();
    loginView = document.getElementById('loginView');
    dashView = document.getElementById('dashView');
    loginForm = document.getElementById('loginForm');
    loginError = document.getElementById('loginError');
    pw = document.getElementById('pw');

    setupTabs();
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', async function () {
      await Auth.logout();
      show('login');
    });

    // If the session expires mid-use, any API call returning 401 sends us back.
    AdminApi.setUnauthorizedHandler(function () { show('login'); });

    try {
      var authed = await Auth.check();
      if (authed) { startDashboard(); } else { show('login'); }
    } catch (e) {
      show('login');
    }
  }

  document.addEventListener('DOMContentLoaded', boot);

})();
