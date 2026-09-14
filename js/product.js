/* ============================================================
   product.js — страница товара.

   Важно: этот файл БОЛЬШЕ НЕ РАБОТАЕТ С КОРЗИНОЙ.
   Раньше здесь был второй обработчик «Добавить в корзину»,
   из-за которого товар добавлялся дважды и в другом формате
   (без quantity), а счётчик считал позиции вместо количества.
   Теперь корзина живёт только в cart.js — этот файл лишь
   выводит данные товара.
   ============================================================ */

(function () {
  'use strict';

  function formatPrice(value) {
    return Number(value).toLocaleString('ru-RU') + ' ₽';
  }

  function getId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id') || '1';
  }

  function renderGallery(product) {
    var gallery = document.querySelector('.product__gallery');
    if (!gallery) return;

    var shots = [product.image];
    if (product.hover) shots.push(product.hover);

    gallery.innerHTML = '';

    var main = document.createElement('img');
    main.className = 'product__image';
    main.src = shots[0];
    main.alt = product.name;
    gallery.appendChild(main);

    if (shots.length < 2) return;

    var thumbs = document.createElement('div');
    thumbs.className = 'product__thumbs';

    shots.forEach(function (src, i) {
      var thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'product__thumb' + (i === 0 ? ' is-active' : '');
      thumb.setAttribute('aria-label', 'Фото ' + (i + 1));

      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      thumb.appendChild(img);

      thumb.addEventListener('click', function () {
        main.src = src;
        thumbs.querySelectorAll('.product__thumb').forEach(function (t) {
          t.classList.remove('is-active');
        });
        thumb.classList.add('is-active');
      });

      thumbs.appendChild(thumb);
    });

    gallery.appendChild(thumbs);
  }

  function renderSizes(product) {
    var holder = document.querySelector('.product__sizes');
    if (!holder) return;

    if (!product.sizes || !product.sizes.length) {
      holder.innerHTML = '';
      holder.appendChild(Object.assign(document.createElement('p'), {
        className: 'product__onesize',
        textContent: 'Один размер'
      }));
      return;
    }

    holder.innerHTML = '';

    var label = document.createElement('span');
    label.className = 'product__label';
    label.textContent = 'Размер';
    holder.appendChild(label);

    var list = document.createElement('div');
    list.className = 'size-picker';
    list.setAttribute('role', 'radiogroup');
    list.setAttribute('aria-label', 'Размер');

    // Скрытый input хранит выбранный размер — его читает cart.js
    var hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.value = '';
    hidden.setAttribute('data-size-input', '');

    product.sizes.forEach(function (size) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-picker__item';
      btn.textContent = size;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');

      btn.addEventListener('click', function () {
        hidden.value = size;
        list.querySelectorAll('.size-picker__item').forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-checked', 'true');
        var scope = btn.closest('[data-product]');
        if (scope) scope.classList.remove('needs-size');
      });

      list.appendChild(btn);
    });

    holder.appendChild(list);
    holder.appendChild(hidden);
  }

  function renderDetails(product) {
    var box = document.querySelector('.product__details');
    if (!box) return;

    box.innerHTML = '';

    [
      ['Описание', product.description],
      ['Состав', product.composition],
      ['Уход', product.care]
    ].forEach(function (pair, i) {
      var item = document.createElement('details');
      item.className = 'accordion';
      if (i === 0) item.open = true;

      var summary = document.createElement('summary');
      summary.className = 'accordion__head';
      summary.textContent = pair[0];

      var text = document.createElement('p');
      text.className = 'accordion__text';
      text.textContent = pair[1] || '—';

      item.appendChild(summary);
      item.appendChild(text);
      box.appendChild(item);
    });
  }

  function renderRelated(product) {
    var holder = document.querySelector('.related__grid');
    if (!holder || !window.PRODUCTS) return;

    var others = window.PRODUCTS.filter(function (p) { return p.id !== product.id; }).slice(0, 4);
    holder.innerHTML = '';

    others.forEach(function (p) {
      var link = document.createElement('a');
      link.className = 'related__card';
      link.href = 'product.html?id=' + encodeURIComponent(p.id);

      var img = document.createElement('img');
      img.src = p.image;
      img.alt = p.name;
      img.loading = 'lazy';

      var name = document.createElement('span');
      name.className = 'related__name';
      name.textContent = p.name;

      var price = document.createElement('span');
      price.className = 'related__price';
      price.textContent = formatPrice(p.price);

      link.appendChild(img);
      link.appendChild(name);
      link.appendChild(price);
      holder.appendChild(link);
    });
  }

  function renderNotFound() {
    var main = document.querySelector('.product');
    if (!main) return;
    main.innerHTML =
      '<div class="product__missing">' +
      '<h1>Товар не найден</h1>' +
      '<p>Возможно, ссылка устарела.</p>' +
      '<a class="btn btn--primary" href="index.html#catalog">Вернуться в каталог</a>' +
      '</div>';
  }

  function init() {
    var product = typeof window.findProduct === 'function' ? window.findProduct(getId()) : null;

    if (!product) {
      renderNotFound();
      return;
    }

    document.title = product.name + ' — Les Échos Du Passé';

    var title = document.querySelector('.product__title');
    if (title) title.textContent = product.name;

    var price = document.querySelector('.product__price');
    if (price) price.textContent = formatPrice(product.price);

    var scope = document.querySelector('[data-product]');
    if (scope) scope.setAttribute('data-id', product.id);

    var addBtn = document.querySelector('[data-add-to-cart]');
    if (addBtn) addBtn.setAttribute('data-id', product.id);

    var crumb = document.querySelector('[data-crumb]');
    if (crumb) crumb.textContent = product.name;

    renderGallery(product);
    renderSizes(product);
    renderDetails(product);
    renderRelated(product);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
