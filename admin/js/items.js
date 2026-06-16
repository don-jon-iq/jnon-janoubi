/* Items — CRUD + reorder for items within the selected collection */
'use strict';

var Items = (function () {

  var section, listEl, titleEl;
  var current = null; // current collection
  var cache = [];     // current items (ordered)

  function base() { return '/api/admin/collections/' + current.id + '/items'; }

  function slugify(s) {
    return (s || '').toLowerCase().trim()
      .replace(/[^a-z0-9؀-ۿ\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function load(collection) {
    current = collection;
    section.hidden = false;
    titleEl.textContent = 'قطع: ' + collection.name;
    listEl.innerHTML = '<p class="adm-empty">…تحميل</p>';
    try {
      cache = await AdminApi.get(base());
      render();
    } catch (e) {
      listEl.innerHTML = '<p class="adm-empty">تعذّر تحميل القطع.</p>';
    }
  }

  function render() {
    if (cache.length === 0) {
      listEl.innerHTML = '<p class="adm-empty">لا توجد قطع، أضف قطعة جديدة.</p>';
      return;
    }
    listEl.innerHTML = '';
    cache.forEach(function (item, index) {
      var row = document.createElement('div');
      row.className = 'adm-row';
      row.innerHTML =
        '<div class="adm-thumb">' + (item.image ? '<img src="/' + item.image + '" alt="">' : '') + '</div>' +
        '<div class="adm-info">' +
          '<strong></strong>' +
          '<span class="adm-price"></span>' +
        '</div>' +
        '<div class="adm-actions">' +
          '<button type="button" class="icon-btn" data-act="up" ' + (index === 0 ? 'disabled' : '') + '>▲</button>' +
          '<button type="button" class="icon-btn" data-act="down" ' + (index === cache.length - 1 ? 'disabled' : '') + '>▼</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-act="edit">تعديل</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-act="del">حذف</button>' +
        '</div>';
      row.querySelector('strong').textContent = item.name;
      row.querySelector('.adm-price').textContent = Number(item.price).toLocaleString('ar-IQ');
      row.querySelector('[data-act="edit"]').addEventListener('click', function () { openForm(item); });
      row.querySelector('[data-act="del"]').addEventListener('click', function () { remove(item); });
      row.querySelector('[data-act="up"]').addEventListener('click', function () { move(index, -1); });
      row.querySelector('[data-act="down"]').addEventListener('click', function () { move(index, 1); });
      listEl.appendChild(row);
    });
  }

  async function move(index, dir) {
    var target = index + dir;
    if (target < 0 || target >= cache.length) { return; }
    var ids = cache.map(function (i) { return i.id; });
    var tmp = ids[index]; ids[index] = ids[target]; ids[target] = tmp;
    try {
      await AdminApi.put(base() + '/reorder', { order: ids });
      await load(current);
    } catch (e) { AdminUI.toast(e.message, 'error'); }
  }

  async function remove(item) {
    var ok = await AdminUI.confirm('حذف القطعة «' + item.name + '»؟', 'حذف');
    if (!ok) { return; }
    try {
      await AdminApi.del(base() + '/' + item.id);
      AdminUI.toast('تم حذف القطعة', 'ok');
      await load(current);
    } catch (e) { AdminUI.toast(e.message, 'error'); }
  }

  function openForm(item) {
    var isNew = !item;
    var form = document.createElement('form');
    form.className = 'card-form';
    form.innerHTML =
      '<div class="field">' +
        '<label>الاسم</label>' +
        '<input type="text" name="name" required maxlength="120">' +
      '</div>' +
      '<div class="field" data-id-field>' +
        '<label>المعرّف (إنجليزي، يُنشأ تلقائياً)</label>' +
        '<input type="text" name="id" pattern="[a-z0-9-]{1,64}">' +
      '</div>' +
      '<div class="field">' +
        '<label>الوصف</label>' +
        '<textarea name="description" rows="3" maxlength="500"></textarea>' +
      '</div>' +
      '<div class="field">' +
        '<label>السعر (بالدينار)</label>' +
        '<input type="number" name="price" min="0" step="250" required>' +
      '</div>' +
      '<div class="field">' +
        '<label>الصورة</label>' +
        '<div data-image-mount></div>' +
      '</div>' +
      '<p class="field-error" data-form-error></p>' +
      '<div class="modal-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-cancel>إلغاء</button>' +
        '<button type="submit" class="btn btn-primary btn-sm">حفظ</button>' +
      '</div>';

    var nameInput = form.querySelector('[name="name"]');
    var idInput = form.querySelector('[name="id"]');
    var idField = form.querySelector('[data-id-field]');
    var errEl = form.querySelector('[data-form-error]');
    var imageControl = MediaPicker.field(item ? item.image : '');
    form.querySelector('[data-image-mount]').appendChild(imageControl);

    if (item) {
      nameInput.value = item.name;
      idInput.value = item.id;
      form.querySelector('[name="description"]').value = item.description || '';
      form.querySelector('[name="price"]').value = item.price;
      idField.hidden = true; // id is immutable on edit
    } else {
      var autoId = true;
      idInput.addEventListener('input', function () { autoId = false; });
      nameInput.addEventListener('input', function () {
        if (autoId) { idInput.value = slugify(nameInput.value); }
      });
    }

    form.querySelector('[data-cancel]').addEventListener('click', AdminUI.close);
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errEl.textContent = '';
      var payload = {
        name: nameInput.value.trim(),
        description: form.querySelector('[name="description"]').value.trim(),
        price: Number(form.querySelector('[name="price"]').value),
        image: imageControl.getValue() || undefined
      };
      try {
        if (isNew) {
          payload.id = (idInput.value || slugify(nameInput.value)).trim();
          await AdminApi.post(base(), payload);
        } else {
          await AdminApi.put(base() + '/' + item.id, payload);
        }
        AdminUI.close();
        AdminUI.toast(isNew ? 'تمت إضافة القطعة' : 'تم حفظ التعديل', 'ok');
        await load(current);
      } catch (err) {
        errEl.textContent = err.message;
      }
    });

    AdminUI.modal(isNew ? 'قطعة جديدة' : 'تعديل القطعة', form);
  }

  function init() {
    section = document.getElementById('itemsSection');
    listEl = document.getElementById('itemsList');
    titleEl = document.getElementById('itemsTitle');
    document.getElementById('addItem').addEventListener('click', function () {
      if (current) { openForm(null); }
    });
    document.getElementById('closeItems').addEventListener('click', function () {
      section.hidden = true;
      current = null;
    });
  }

  return { init: init, load: load };

})();
