/* Collections — CRUD, availability toggle, reorder, and select-to-edit-items */
'use strict';

var Collections = (function () {

  var listEl;
  var cache = [];

  var BASE = '/api/admin/collections';

  function slugify(s) {
    return (s || '').toLowerCase().trim()
      .replace(/[^a-z0-9؀-ۿ\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function load() {
    listEl.innerHTML = '<p class="adm-empty">…تحميل</p>';
    try {
      cache = await AdminApi.get(BASE);
      render();
    } catch (e) {
      listEl.innerHTML = '<p class="adm-empty">تعذّر تحميل المجموعات.</p>';
    }
  }

  function render() {
    if (cache.length === 0) {
      listEl.innerHTML = '<p class="adm-empty">لا توجد مجموعات، أضف مجموعة جديدة.</p>';
      return;
    }
    listEl.innerHTML = '';
    cache.forEach(function (col, index) {
      var row = document.createElement('div');
      row.className = 'adm-row';
      row.innerHTML =
        '<div class="adm-thumb">' + (col.image ? '<img src="/' + col.image + '" alt="">' : '') + '</div>' +
        '<div class="adm-info">' +
          '<strong></strong>' +
          '<span class="adm-meta"></span>' +
        '</div>' +
        '<div class="adm-actions">' +
          '<button type="button" class="icon-btn" data-act="up" ' + (index === 0 ? 'disabled' : '') + '>▲</button>' +
          '<button type="button" class="icon-btn" data-act="down" ' + (index === cache.length - 1 ? 'disabled' : '') + '>▼</button>' +
          '<label class="switch"><input type="checkbox" data-act="avail" ' + (col.available ? 'checked' : '') + '><span></span></label>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-act="items">القطع (' + col.itemCount + ')</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-act="edit">تعديل</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-act="del">حذف</button>' +
        '</div>';
      row.querySelector('strong').textContent = col.name;
      row.querySelector('.adm-meta').textContent = (col.tag ? col.tag + ' · ' : '') + (col.available ? 'معروضة' : 'مخفية');
      row.querySelector('[data-act="items"]').addEventListener('click', function () { Items.load(col); });
      row.querySelector('[data-act="edit"]').addEventListener('click', function () { openForm(col); });
      row.querySelector('[data-act="del"]').addEventListener('click', function () { remove(col); });
      row.querySelector('[data-act="avail"]').addEventListener('change', function (e) { toggle(col, e.target.checked); });
      row.querySelector('[data-act="up"]').addEventListener('click', function () { move(index, -1); });
      row.querySelector('[data-act="down"]').addEventListener('click', function () { move(index, 1); });
      listEl.appendChild(row);
    });
  }

  async function toggle(col, available) {
    try {
      await AdminApi.put(BASE + '/' + col.id, {
        name: col.name, tag: col.tag, description: col.description,
        image: col.image || undefined, available: available
      });
      col.available = available;
      AdminUI.toast(available ? 'أصبحت معروضة' : 'أصبحت مخفية', 'ok');
      render();
    } catch (e) { AdminUI.toast(e.message, 'error'); load(); }
  }

  async function move(index, dir) {
    var target = index + dir;
    if (target < 0 || target >= cache.length) { return; }
    var ids = cache.map(function (c) { return c.id; });
    var tmp = ids[index]; ids[index] = ids[target]; ids[target] = tmp;
    try {
      await AdminApi.put(BASE + '/reorder', { order: ids });
      await load();
    } catch (e) { AdminUI.toast(e.message, 'error'); }
  }

  async function remove(col) {
    var ok = await AdminUI.confirm('حذف المجموعة «' + col.name + '» وكل قطعها؟', 'حذف');
    if (!ok) { return; }
    try {
      await AdminApi.del(BASE + '/' + col.id);
      AdminUI.toast('تم حذف المجموعة', 'ok');
      document.getElementById('itemsSection').hidden = true;
      await load();
    } catch (e) { AdminUI.toast(e.message, 'error'); }
  }

  function openForm(col) {
    var isNew = !col;
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
        '<label>الوسم (اختياري)</label>' +
        '<input type="text" name="tag" maxlength="60">' +
      '</div>' +
      '<div class="field">' +
        '<label>الوصف</label>' +
        '<textarea name="description" rows="2" maxlength="500"></textarea>' +
      '</div>' +
      '<div class="field">' +
        '<label>صورة المجموعة</label>' +
        '<div data-image-mount></div>' +
      '</div>' +
      '<label class="check-row"><input type="checkbox" name="available" checked> معروضة في المتجر</label>' +
      '<p class="field-error" data-form-error></p>' +
      '<div class="modal-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-cancel>إلغاء</button>' +
        '<button type="submit" class="btn btn-primary btn-sm">حفظ</button>' +
      '</div>';

    var nameInput = form.querySelector('[name="name"]');
    var idInput = form.querySelector('[name="id"]');
    var idField = form.querySelector('[data-id-field]');
    var errEl = form.querySelector('[data-form-error]');
    var imageControl = MediaPicker.field(col ? col.image : '');
    form.querySelector('[data-image-mount]').appendChild(imageControl);

    if (col) {
      nameInput.value = col.name;
      idInput.value = col.id;
      form.querySelector('[name="tag"]').value = col.tag || '';
      form.querySelector('[name="description"]').value = col.description || '';
      form.querySelector('[name="available"]').checked = !!col.available;
      idField.hidden = true;
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
        tag: form.querySelector('[name="tag"]').value.trim() || undefined,
        description: form.querySelector('[name="description"]').value.trim(),
        image: imageControl.getValue() || undefined,
        available: form.querySelector('[name="available"]').checked
      };
      try {
        if (isNew) {
          payload.id = (idInput.value || slugify(nameInput.value)).trim();
          await AdminApi.post(BASE, payload);
        } else {
          await AdminApi.put(BASE + '/' + col.id, payload);
        }
        AdminUI.close();
        AdminUI.toast(isNew ? 'تمت إضافة المجموعة' : 'تم حفظ التعديل', 'ok');
        await load();
      } catch (err) {
        errEl.textContent = err.message;
      }
    });

    AdminUI.modal(isNew ? 'مجموعة جديدة' : 'تعديل المجموعة', form);
  }

  function init() {
    listEl = document.getElementById('collectionsList');
    document.getElementById('addCollection').addEventListener('click', function () { openForm(null); });
  }

  return { init: init, load: load };

})();
