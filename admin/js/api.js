/* AdminApi — fetch wrapper: injects CSRF header, unwraps envelope, handles 401 */
'use strict';

var AdminApi = (function () {

  var csrfToken = null;
  var onUnauthorized = function () {};

  function setCsrf(token) { csrfToken = token || null; }
  function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

  async function request(method, url, body, isForm) {
    var opts = { method: method, credentials: 'same-origin', headers: { Accept: 'application/json' } };

    if (method !== 'GET' && csrfToken) {
      opts.headers['X-CSRF-Token'] = csrfToken;
    }
    if (isForm) {
      opts.body = body; // FormData — let the browser set the boundary
    } else if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }

    var res = await fetch(url, opts);
    var data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON */ }

    if (res.status === 401) { onUnauthorized(); }

    if (!res.ok || !data || data.ok === false) {
      var msg = (data && data.error && data.error.message) || ('حدث خطأ (' + res.status + ')');
      var err = new Error(msg);
      err.status = res.status;
      err.code = data && data.error ? data.error.code : null;
      throw err;
    }
    return data.data;
  }

  return {
    setCsrf: setCsrf,
    setUnauthorizedHandler: setUnauthorizedHandler,
    get: function (u) { return request('GET', u); },
    post: function (u, b) { return request('POST', u, b); },
    put: function (u, b) { return request('PUT', u, b); },
    del: function (u) { return request('DELETE', u); },
    upload: function (u, formData) { return request('POST', u, formData, true); }
  };

})();
