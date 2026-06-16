/* Auth — login, logout, and session check */
'use strict';

var Auth = (function () {

  async function check() {
    var me = await AdminApi.get('/api/admin/me');
    if (me.csrfToken) { AdminApi.setCsrf(me.csrfToken); }
    return me.authenticated;
  }

  async function login(password) {
    var data = await AdminApi.post('/api/admin/login', { password: password });
    if (data.csrfToken) { AdminApi.setCsrf(data.csrfToken); }
    return data.authenticated;
  }

  async function logout() {
    try { await AdminApi.post('/api/admin/logout', {}); } catch (e) { /* ignore */ }
    AdminApi.setCsrf(null);
  }

  return { check: check, login: login, logout: logout };

})();
