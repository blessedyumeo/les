/* ============================================================
   cart.js — корзина магазина Les Échos Du Passé

   Что чинит этот файл:
   1. Раньше корзина «не добавляла» товары на shop.html, потому что
      страница подключала js/cart.js вместо ../js/cart.js — скрипт
      просто не загружался. Теперь путь правильный на всех страницах.
   2. Раньше обработчик «Добавить в корзину» был сразу в cart.js И в
      product.js — товар добавлялся дважды и в двух разных форматах.
      Теперь корзину трогает ТОЛЬКО этот файл.
   3. Раньше цена и название брались из вёрстки (textContent) —
      любая правка разметки ломала данные. Теперь всё берётся из
      каталога products.js.
   4. Раньше счётчик считал то cart.length, то сумму количеств.
      Теперь одна функция на всё.

   Публичный API (можно дёргать из консоли для проверки):
     Cart.add(id, size, qty)   Cart.remove(key)   Cart.setQty(key, n)
     Cart.clear()              Cart.items()       Cart.total()
     Cart.count()              Cart.open()        Cart.close()
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'ledp:cart:v2';   // текущий формат хранения
  var LEGACY_KEY = 'cart';            // старый ключ — переносим и удаляем

  var state = [];        // [{ id, name, price, image, size, quantity }]
  var root = null;       // корневой элемент боковой панели
  var lastFocused = null;

  /* ==========================================================
     1. Утилиты
     ========================================================== */

  /** «3800rub», « 4 100 ₽ », 3800 → 3800. Никаких NaN в корзине. */
  function toNumber(value) {
    if (typeof value === 'number') return isFinite(value) ? Math.round(value) : 0;
    var digits = String(value == null ? '' : value).replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  function formatPrice(value) {
    return toNumber(value).toLocaleString('ru-RU') + ' ₽';
  }

  /** Ключ строки корзины. Один товар в разных размерах — разные строки. */
  function lineKey(item) {
    return item.id + '::' + (item.size || '-');
  }

  function plural(n, one, few, many) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
    return many;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;   // textContent, а не innerHTML
    return node;
  }

  /* ==========================================================
     2. Хранилище (localStorage + аккуратная деградация)
     ========================================================== */

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  function storageRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  /**
   * Приводит что угодно к корректному массиву строк корзины
   * и склеивает дубликаты. Сюда попадают и старые записи из
   * localStorage, сохранённые прошлой версией сайта.
   */
  function normalize(raw) {
    if (!Array.isArray(raw)) return [];

    var merged = [];
    var index = {};

    raw.forEach(function (entry) {
      if (!entry || typeof entry !== 'object') return;

      var id = String(entry.id == null ? '' : entry.id).trim();
      if (!id) return;

      // Каталог — источник истины. Если товара в каталоге нет,
      // опираемся на то, что было сохранено раньше.
      var product = typeof window.findProduct === 'function' ? window.findProduct(id) : null;

      var item = {
        id: id,
        name: product ? product.name : String(entry.name || 'Товар'),
        price: product ? toNumber(product.price) : toNumber(entry.price),
        image: product ? product.image : String(entry.image || ''),
        size: entry.size ? String(entry.size) : '',
        quantity: Math.max(1, parseInt(entry.quantity, 10) || 1)
      };

      var key = lineKey(item);
      if (index[key] != null) {
        merged[index[key]].quantity += item.quantity;
      } else {
        index[key] = merged.length;
        merged.push(item);
      }
    });

    return merged;
  }

  function load() {
    var raw = storageGet(STORAGE_KEY);

    // Перенос старой корзины на новый формат (один раз).
    if (raw === null) {
      var legacy = storageGet(LEGACY_KEY);
      if (legacy !== null) {
        raw = legacy;
        storageRemove(LEGACY_KEY);
      }
    }

    if (!raw) return [];

    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    return normalize(parsed);
  }

  function save() {
    storageSet(STORAGE_KEY, JSON.stringify(state));
  }

  /* ==========================================================
     3. Операции над корзиной
     ========================================================== */

  function count() {
    return state.reduce(function (sum, item) { return sum + item.quantity; }, 0);
  }

  function total() {
    return state.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
  }

  function findLine(key) {
    for (var i = 0; i < state.length; i++) {
      if (lineKey(state[i]) === key) return i;
    }
    return -1;
  }

  function add(id, size, qty) {
    var product = typeof window.findProduct === 'function' ? window.findProduct(id) : null;
    if (!product) {
      console.warn('[cart] товар не найден в каталоге:', id);
      return false;
    }

    var item = {
      id: String(product.id),
      name: product.name,
      price: toNumber(product.price),
      image: product.image,
      size: size ? String(size) : '',
      quantity: Math.max(1, parseInt(qty, 10) || 1)
    };

    var i = findLine(lineKey(item));
    if (i >= 0) {
      state[i].quantity += item.quantity;
    } else {
      state.push(item);
    }

    commit();
    return true;
  }

  function setQty(key, qty) {
    var i = findLine(key);
    if (i < 0) return;

    var next = parseInt(qty, 10) || 0;
    if (next <= 0) {
      state.splice(i, 1);
    } else {
      state[i].quantity = Math.min(next, 99);
    }
    commit();
  }

  function remove(key) {
    var i = findLine(key);
    if (i < 0) return;
    state.splice(i, 1);
    commit();
  }

  function clear() {
    state = [];
    commit();
  }

  /** Сохранить + перерисовать всё, что зависит от корзины. */
  function commit() {
    save();
    renderCounter();
    renderLines();
  }

  /* ==========================================================
     4. Счётчик в шапке
     ========================================================== */

  function renderCounter() {
    var n = count();
    document.querySelectorAll('.cart-counter').forEach(function (node) {
      node.textContent = String(n);
      node.classList.toggle('is-empty', n === 0);
    });

    var button = document.getElementById('cart-button');
    if (button) {
      button.setAttribute(
        'aria-label',
        n === 0 ? 'Корзина пуста' : 'Корзина: ' + n + ' ' + plural(n, 'товар', 'товара', 'товаров')
      );
    }
  }

  /* ==========================================================
     5. Боковая панель корзины
     Разметка создаётся скриптом, поэтому одинакова на всех
     страницах и не может «разъехаться» между файлами.
     ========================================================== */

  function buildDrawer() {
    if (document.getElementById('cart-drawer')) {
      root = document.getElementById('cart-drawer');
      return;
    }

    root = el('div', 'cart-drawer');
    root.id = 'cart-drawer';
    root.hidden = true;

    var overlay = el('div', 'cart-drawer__overlay');
    overlay.setAttribute('data-cart-close', '');

    var panel = el('aside', 'cart-drawer__panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Корзина');

    var head = el('header', 'cart-drawer__head');
    head.appendChild(el('h2', 'cart-drawer__title', 'Корзина'));

    var closeBtn = el('button', 'cart-drawer__close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('data-cart-close', '');
    closeBtn.setAttribute('aria-label', 'Закрыть корзину');
    head.appendChild(closeBtn);

    var body = el('div', 'cart-drawer__body');

    var foot = el('footer', 'cart-drawer__foot');
    var totalRow = el('div', 'cart-drawer__total');
    totalRow.appendChild(el('span', null, 'Итого'));
    totalRow.appendChild(el('strong', 'cart-drawer__sum', formatPrice(0)));
    foot.appendChild(totalRow);
    foot.appendChild(el('p', 'cart-drawer__note', 'Доставка рассчитывается на следующем шаге'));

    var checkout = el('button', 'cart-drawer__checkout', 'Оформить заказ');
    checkout.type = 'button';
    foot.appendChild(checkout);

    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(foot);
    root.appendChild(overlay);
    root.appendChild(panel);
    document.body.appendChild(root);

    /* --- события внутри панели --- */

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-cart-close]')) {
        close();
        return;
      }

      var line = e.target.closest('.cart-line');
      if (!line) return;
      var key = line.getAttribute('data-key');

      if (e.target.closest('[data-remove]')) {
        remove(key);
        return;
      }

      var step = e.target.closest('[data-step]');
      if (step) {
        var i = findLine(key);
        if (i >= 0) setQty(key, state[i].quantity + parseInt(step.getAttribute('data-step'), 10));
      }
    });

    checkout.addEventListener('click', function () {
      if (state.length === 0) return;
      var sum = formatPrice(total());
      clear();
      body.innerHTML = '';
      var done = el('div', 'cart-drawer__done');
      done.appendChild(el('div', 'cart-drawer__done-mark', '✓'));
      done.appendChild(el('h3', null, 'Заказ оформлен'));
      done.appendChild(el('p', null, 'Сумма заказа: ' + sum + '. Мы напишем вам в Telegram, чтобы подтвердить детали.'));
      body.appendChild(done);
    });
  }

  function renderLines() {
    if (!root) return;

    var body = root.querySelector('.cart-drawer__body');
    var sum = root.querySelector('.cart-drawer__sum');
    var title = root.querySelector('.cart-drawer__title');
    if (!body || !sum) return;

    body.innerHTML = '';
    sum.textContent = formatPrice(total());

    var n = count();
    title.textContent = n === 0
      ? 'Корзина'
      : 'Корзина · ' + n + ' ' + plural(n, 'товар', 'товара', 'товаров');

    root.querySelector('.cart-drawer__checkout').disabled = state.length === 0;

    if (state.length === 0) {
      var empty = el('div', 'cart-drawer__empty');
      empty.appendChild(el('p', null, 'Пока пусто.'));
      empty.appendChild(el('p', 'cart-drawer__empty-hint', 'Выберите что-нибудь в каталоге — товары сохранятся, даже если закрыть вкладку.'));
      body.appendChild(empty);
      return;
    }

    state.forEach(function (item) {
      var line = el('article', 'cart-line');
      line.setAttribute('data-key', lineKey(item));

      var img = el('img', 'cart-line__img');
      img.src = item.image;
      img.alt = item.name;
      img.loading = 'lazy';
      line.appendChild(img);

      var info = el('div', 'cart-line__info');
      info.appendChild(el('h3', 'cart-line__name', item.name));
      if (item.size) info.appendChild(el('p', 'cart-line__meta', 'Размер: ' + item.size));
      info.appendChild(el('p', 'cart-line__unit', formatPrice(item.price) + ' за шт.'));

      var qty = el('div', 'cart-line__qty');
      var minus = el('button', 'cart-line__step', '−');
      minus.type = 'button';
      minus.setAttribute('data-step', '-1');
      minus.setAttribute('aria-label', 'Уменьшить количество');

      var plus = el('button', 'cart-line__step', '+');
      plus.type = 'button';
      plus.setAttribute('data-step', '1');
      plus.setAttribute('aria-label', 'Увеличить количество');

      qty.appendChild(minus);
      qty.appendChild(el('span', 'cart-line__count', String(item.quantity)));
      qty.appendChild(plus);
      info.appendChild(qty);
      line.appendChild(info);

      var right = el('div', 'cart-line__right');
      right.appendChild(el('span', 'cart-line__price', formatPrice(item.price * item.quantity)));
      var rm = el('button', 'cart-line__remove', 'Удалить');
      rm.type = 'button';
      rm.setAttribute('data-remove', '');
      right.appendChild(rm);
      line.appendChild(right);

      body.appendChild(line);
    });
  }

  function open() {
    if (!root) return;
    lastFocused = document.activeElement;
    renderLines();
    root.hidden = false;
    document.body.classList.add('is-cart-open');
    requestAnimationFrame(function () {
      root.classList.add('is-open');
      var closeBtn = root.querySelector('.cart-drawer__close');
      if (closeBtn) closeBtn.focus();
    });
  }

  function close() {
    if (!root || root.hidden) return;
    root.classList.remove('is-open');
    document.body.classList.remove('is-cart-open');
    window.setTimeout(function () { root.hidden = true; }, 280);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  /* ==========================================================
     6. Уведомление «добавлено»
     ========================================================== */

  var toastTimer = null;

  function toast(text) {
    var node = document.querySelector('.cart-toast');
    if (!node) {
      node = el('div', 'cart-toast');
      node.setAttribute('role', 'status');
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      node.classList.remove('is-visible');
    }, 2200);
  }

  /* ==========================================================
     7. Кнопки «в корзину» на любых страницах
     Достаточно повесить на элемент data-add-to-cart и data-id.
     Размер: либо data-size прямо на кнопке, либо селект/радио
     с атрибутом data-size-input внутри ближайшего [data-product].
     ========================================================== */

  function resolveSize(button) {
    if (button.hasAttribute('data-size')) return button.getAttribute('data-size');

    var scope = button.closest('[data-product]') || document;
    var input = scope.querySelector('[data-size-input]');
    if (!input) return '';

    if (input.tagName === 'SELECT' || input.tagName === 'INPUT') return input.value || '';
    var checked = scope.querySelector('[data-size-input] :checked, [name="size"]:checked');
    return checked ? checked.value : '';
  }

  document.addEventListener('click', function (e) {
    var button = e.target.closest('[data-add-to-cart]');
    if (!button) return;

    e.preventDefault();

    var id = button.getAttribute('data-id');
    var size = resolveSize(button);
    var product = typeof window.findProduct === 'function' ? window.findProduct(id) : null;

    // Если у товара есть размеры, а размер не выбран — просим выбрать.
    if (product && product.sizes && product.sizes.length && !size) {
      var picker = button.closest('[data-product]');
      if (picker) picker.classList.add('needs-size');
      toast('Выберите размер');
      return;
    }

    if (!add(id, size, 1)) return;

    var label = button.getAttribute('data-added-label') || 'Добавлено';
    var original = button.getAttribute('data-label') || button.textContent;
    button.setAttribute('data-label', original);
    button.textContent = label;
    button.classList.add('is-added');
    window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove('is-added');
    }, 1400);

    toast(product.name + (size ? ' (' + size + ')' : '') + ' — в корзине');
  });

  /* Открыть корзину: любой элемент с id="cart-button" или data-cart-open. */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('#cart-button, [data-cart-open]');
    if (!trigger) return;
    e.preventDefault();
    open();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  /* Корзина открыта в двух вкладках — синхронизируем. */
  window.addEventListener('storage', function (e) {
    if (e.key !== STORAGE_KEY) return;
    state = load();
    renderCounter();
    renderLines();
  });

  /* ==========================================================
     8. Старт
     ========================================================== */

  function init() {
    state = load();
    buildDrawer();
    renderCounter();
    renderLines();
    save(); // сразу приводим хранилище к новому формату
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Cart = {
    add: add,
    remove: remove,
    setQty: setQty,
    clear: clear,
    items: function () { return state.slice(); },
    count: count,
    total: total,
    open: open,
    close: close
  };
})();
