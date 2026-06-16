/* MediaPicker — modal to upload a new image or pick an existing one */
'use strict';

var MediaPicker = (function () {

  /** open(onPick): onPick(path) is called with the chosen image path. */
  async function open(onPick) {
    var wrap = document.createElement('div');
    wrap.className = 'media-picker';
    wrap.innerHTML =
      '<div class="media-upload">' +
        '<label class="media-drop" for="mediaFile">' +
          '<span>اسحب صورة هنا أو اضغط للاختيار</span>' +
          '<small>JPG · PNG · WEBP · GIF — حتى ٥ ميغابايت</small>' +
        '</label>' +
        '<input type="file" id="mediaFile" accept="image/*" hidden>' +
        '<p class="media-status" id="mediaStatus"></p>' +
      '</div>' +
      '<div class="media-grid" id="mediaGrid"></div>';

    AdminUI.modal('الصور', wrap);

    var fileInput = wrap.querySelector('#mediaFile');
    var drop = wrap.querySelector('.media-drop');
    var status = wrap.querySelector('#mediaStatus');
    var grid = wrap.querySelector('#mediaGrid');

    function choose(path) {
      AdminUI.close();
      onPick(path);
    }

    async function refresh() {
      grid.innerHTML = '<p class="media-empty">…تحميل</p>';
      try {
        var data = await AdminApi.get('/api/admin/media');
        var all = data.uploads.concat(data.assets);
        if (all.length === 0) {
          grid.innerHTML = '<p class="media-empty">لا توجد صور بعد، ارفع صورة.</p>';
          return;
        }
        grid.innerHTML = '';
        all.forEach(function (m) {
          var cell = document.createElement('button');
          cell.type = 'button';
          cell.className = 'media-cell';
          cell.title = m.path;
          cell.innerHTML = '<img src="/' + m.path + '" alt="" loading="lazy">';
          cell.addEventListener('click', function () { choose(m.path); });
          grid.appendChild(cell);
        });
      } catch (e) {
        grid.innerHTML = '<p class="media-empty">تعذّر تحميل الصور.</p>';
      }
    }

    async function uploadFile(file) {
      if (!file) { return; }
      status.textContent = '…جارٍ الرفع';
      var fd = new FormData();
      fd.append('file', file);
      try {
        var result = await AdminApi.upload('/api/admin/media', fd);
        status.textContent = '';
        choose(result.path);
      } catch (e) {
        status.textContent = e.message;
      }
    }

    fileInput.addEventListener('change', function () { uploadFile(fileInput.files[0]); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('is-over'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('is-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) { uploadFile(e.dataTransfer.files[0]); }
    });

    refresh();
  }

  /** Build an image-field control (preview + choose button + hidden value). */
  function field(currentPath) {
    var node = document.createElement('div');
    node.className = 'image-field';
    node.innerHTML =
      '<div class="image-preview" data-preview></div>' +
      '<div class="image-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-choose>اختر صورة</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-clear>إزالة</button>' +
      '</div>';

    var preview = node.querySelector('[data-preview]');
    var value = currentPath || '';

    function render() {
      if (value) {
        preview.innerHTML = '<img src="/' + value + '" alt="">';
      } else {
        preview.innerHTML = '<span class="image-empty">لا صورة</span>';
      }
    }

    node.querySelector('[data-choose]').addEventListener('click', function () {
      open(function (path) { value = path; render(); });
    });
    node.querySelector('[data-clear]').addEventListener('click', function () { value = ''; render(); });

    render();
    node.getValue = function () { return value; };
    return node;
  }

  return { open: open, field: field };

})();
