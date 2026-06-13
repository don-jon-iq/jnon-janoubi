/* =====================================================
   جنون جنوبي — wizard.js
   Step state machine + rendering (immutable state)
   ===================================================== */

'use strict';

var Wizard = (function () {

  // ---- state (replaced, never mutated) ----
  var state = Object.freeze({
    step: 1,
    collectionId: null,
    quantities: Object.freeze({}) // { itemId: number }
  });

  function setState(patch) {
    state = Object.freeze(Object.assign({}, state, patch));
    render();
  }

  function getState() { return state; }

  // ---- helpers ----
  function getCollection() {
    var found = null;
    STORE_CONFIG.COLLECTIONS.forEach(function (c) {
      if (c.id === state.collectionId) { found = c; }
    });
    return found;
  }

  function getPickedItems() {
    var collection = getCollection();
    if (!collection) { return []; }
    return collection.items
      .filter(function (item) { return (state.quantities[item.id] || 0) > 0; })
      .map(function (item) {
        return { item: item, qty: state.quantities[item.id] };
      });
  }

  function getTotal() {
    return getPickedItems().reduce(function (sum, entry) {
      return sum + entry.item.price * entry.qty;
    }, 0);
  }

  function formatPrice(amount) {
    return amount.toLocaleString('ar-IQ') + ' ' + STORE_CONFIG.CURRENCY;
  }

  // ---- navigation ----
  var lastStep = 1;

  function goTo(step) {
    lastStep = state.step;
    setState({ step: step });
  }

  function chooseCollection(id) {
    setState({ collectionId: id, quantities: Object.freeze({}) });
    goTo(2);
  }

  function changeQty(itemId, delta) {
    var current = state.quantities[itemId] || 0;
    var next = Math.min(20, Math.max(0, current + delta));
    var quantities = Object.assign({}, state.quantities);
    quantities[itemId] = next;
    setState({ quantities: Object.freeze(quantities) });
  }

  function reset() {
    lastStep = state.step;
    setState({ step: 1, collectionId: null, quantities: Object.freeze({}) });
  }

  // ---- rendering ----
  function render() {
    renderSteps();
    renderPanels();
    renderProducts();
    renderSummary();
    renderContinue();
  }

  function renderSteps() {
    var visualStep = Math.min(state.step, 3);
    document.querySelectorAll('#stepsBar .step').forEach(function (el) {
      var num = Number(el.getAttribute('data-step'));
      el.classList.toggle('is-current', num === visualStep);
      el.classList.toggle('is-done', num < visualStep || state.step === 4);
    });
  }

  function renderPanels() {
    var goingBack = state.step < lastStep;
    document.querySelectorAll('#wizard .panel').forEach(function (panel) {
      var num = Number(panel.getAttribute('data-panel'));
      var active = num === state.step;
      panel.classList.toggle('is-active', active);
      panel.classList.toggle('from-back', active && goingBack);
    });
  }

  function renderCollections() {
    var grid = document.getElementById('collectionsGrid');
    if (!grid) { return; }
    grid.innerHTML = '';

    STORE_CONFIG.COLLECTIONS.forEach(function (collection) {
      if (collection.available) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'collection-card';
        card.setAttribute('aria-label', 'اختر مجموعة ' + collection.name);
        card.innerHTML =
          '<span class="collection-tag">' + collection.tag + '</span>' +
          '<img src="' + collection.image + '" alt="مجموعة ' + collection.name + '" loading="lazy">' +
          '<span class="collection-card-body">' +
            '<h3>' + collection.name + '</h3>' +
            '<p>' + collection.desc + '</p>' +
          '</span>';
        card.addEventListener('click', function () {
          chooseCollection(collection.id);
        });
        grid.appendChild(card);
      } else {
        var soon = document.createElement('div');
        soon.className = 'collection-card is-soon';
        soon.innerHTML =
          '<span class="collection-soon-mark">قريباً</span>' +
          '<span class="collection-soon-sub">' + collection.desc + '</span>';
        grid.appendChild(soon);
      }
    });
  }

  function renderProducts() {
    var grid = document.getElementById('productsGrid');
    var collection = getCollection();
    if (!grid) { return; }
    grid.innerHTML = '';
    if (!collection) { return; }

    collection.items.forEach(function (item) {
      var qty = state.quantities[item.id] || 0;
      var card = document.createElement('article');
      card.className = 'product-card' + (qty > 0 ? ' is-picked' : '');
      card.innerHTML =
        '<div class="product-media">' +
          '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">' +
        '</div>' +
        '<div class="product-body">' +
          '<h3>' + item.name + '</h3>' +
          '<p class="product-desc">' + item.desc + '</p>' +
          '<p class="product-price">' + formatPrice(item.price) + '</p>' +
          '<div class="qty" role="group" aria-label="كمية ' + item.name + '">' +
            '<button type="button" class="qty-btn" data-act="plus" aria-label="زيادة">+</button>' +
            '<span class="qty-value">' + qty.toLocaleString('ar-IQ') + '</span>' +
            '<button type="button" class="qty-btn" data-act="minus" aria-label="إنقاص">−</button>' +
          '</div>' +
        '</div>';

      card.querySelector('[data-act="plus"]').addEventListener('click', function () {
        changeQty(item.id, 1);
      });
      card.querySelector('[data-act="minus"]').addEventListener('click', function () {
        changeQty(item.id, -1);
      });
      grid.appendChild(card);
    });
  }

  function renderContinue() {
    var btn = document.getElementById('toStep3');
    if (btn) { btn.disabled = getPickedItems().length === 0; }
  }

  function renderSummary() {
    var list = document.getElementById('summaryItems');
    var totalEl = document.getElementById('summaryTotal');
    if (!list || !totalEl) { return; }

    list.innerHTML = '';
    getPickedItems().forEach(function (entry) {
      var li = document.createElement('li');
      li.innerHTML =
        '<strong>' + entry.item.name + ' × ' + entry.qty.toLocaleString('ar-IQ') + '</strong>' +
        '<span>' + formatPrice(entry.item.price * entry.qty) + '</span>';
      list.appendChild(li);
    });
    totalEl.textContent = formatPrice(getTotal());
  }

  // ---- init ----
  function init() {
    renderCollections();

    document.querySelectorAll('[data-nav="back"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goTo(Math.max(1, state.step - 1));
      });
    });

    var toStep3 = document.getElementById('toStep3');
    if (toStep3) {
      toStep3.addEventListener('click', function () { goTo(3); });
    }

    var newOrder = document.getElementById('newOrder');
    if (newOrder) {
      newOrder.addEventListener('click', reset);
    }

    render();
  }

  return {
    init: init,
    goTo: goTo,
    getState: getState,
    getCollection: getCollection,
    getPickedItems: getPickedItems,
    getTotal: getTotal,
    formatPrice: formatPrice
  };

})();
