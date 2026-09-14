/* ============================================================
   shop.js — витрина каталога.
   Рисует сетку карточек из products.js, чтобы цены и названия
   в карточке всегда совпадали со страницей товара и корзиной.
   ============================================================ */

(function () {
  'use strict';

  function formatPrice(value) {
    return Number(value).toLocaleString('ru-RU') + ' ₽';
  }

  function createCard(product) {
    var card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-product', '');
    card.setAttribute('data-id', product.id);

    /* --- картинка + ссылка на страницу товара --- */
    var link = document.createElement('a');
    link.className = 'card__media';
    link.href = 'product.html?id=' + encodeURIComponent(product.id);
    link.setAttribute('aria-label', product.name);

    var img = document.createElement('img');
    img.className = 'card__img';
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';
    link.appendChild(img);

    // Вторая картинка показывается по наведению — чисто на CSS.
    // Раньше это делал JS подменой src, из-за чего в корзину
    // могла попасть «hover»-картинка.
    if (product.hover) {
      var hover = document.createElement('img');
      hover.className = 'card__img card__img--hover';
      hover.src = product.hover;
      hover.alt = '';
      hover.setAttribute('aria-hidden', 'true');
      hover.loading = 'lazy';
      link.appendChild(hover);
    }

    card.appendChild(link);

    /* --- название и цена --- */
    var body = document.createElement('div');
    body.className = 'card__body';

    var title = document.createElement('h2');
    title.className = 'card__name';
    var titleLink = document.createElement('a');
    titleLink.href = link.href;
    titleLink.textContent = product.name;
    title.appendChild(titleLink);

    var price = document.createElement('p');
    price.className = 'card__price';
    price.textContent = formatPrice(product.price);

    body.appendChild(title);
    body.appendChild(price);
    card.appendChild(body);

    /* --- покупка прямо из каталога --- */
    var actions = document.createElement('div');
    actions.className = 'card__actions';

    if (product.sizes && product.sizes.length) {
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'btn btn--primary card__buy';
      toggle.textContent = 'В корзину';
      toggle.setAttribute('data-size-toggle', '');
      toggle.setAttribute('aria-expanded', 'false');

      var sizes = document.createElement('div');
      sizes.className = 'card__sizes';
      sizes.setAttribute('role', 'group');
      sizes.setAttribute('aria-label', 'Выберите размер');

      product.sizes.forEach(function (size) {
        var sizeBtn = document.createElement('button');
        sizeBtn.type = 'button';
        sizeBtn.className = 'card__size';
        sizeBtn.textContent = size;
        sizeBtn.setAttribute('data-add-to-cart', '');
        sizeBtn.setAttribute('data-id', product.id);
        sizeBtn.setAttribute('data-size', size);
        sizeBtn.setAttribute('data-added-label', '✓');
        sizeBtn.title = product.name + ' · размер ' + size;
        sizes.appendChild(sizeBtn);
      });

      actions.appendChild(toggle);
      actions.appendChild(sizes);
    } else {
      var buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'btn btn--primary card__buy';
      buy.textContent = 'В корзину';
      buy.setAttribute('data-add-to-cart', '');
      buy.setAttribute('data-id', product.id);
      buy.setAttribute('data-size', '');
      actions.appendChild(buy);
    }

    card.appendChild(actions);
    return card;
  }

  function render() {
    var grid = document.getElementById('catalog-grid');
    if (!grid || !window.PRODUCTS) return;

    var fragment = document.createDocumentFragment();
    window.PRODUCTS.forEach(function (product) {
      fragment.appendChild(createCard(product));
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);

    var counter = document.querySelector('[data-catalog-count]');
    if (counter) counter.textContent = window.PRODUCTS.length + ' позиций';
  }

  /* Кнопка «В корзину» на карточке раскрывает выбор размера. */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-size-toggle]');
    if (toggle) {
      var card = toggle.closest('.card');
      var open = !card.classList.contains('is-choosing');
      document.querySelectorAll('.card.is-choosing').forEach(function (c) {
        c.classList.remove('is-choosing', 'needs-size');
      });
      card.classList.toggle('is-choosing', open);
      toggle.setAttribute('aria-expanded', String(open));
      return;
    }

    // Размер выбран — сворачиваем панель обратно к кнопке.
    var size = e.target.closest('.card__size');
    if (size) {
      var owner = size.closest('.card');
      window.setTimeout(function () {
        owner.classList.remove('is-choosing');
        var t = owner.querySelector('[data-size-toggle]');
        if (t) t.setAttribute('aria-expanded', 'false');
      }, 900);
      return;
    }

    // Клик мимо карточки — закрываем выбор размера.
    if (!e.target.closest('.card__actions')) {
      document.querySelectorAll('.card.is-choosing').forEach(function (c) {
        c.classList.remove('is-choosing', 'needs-size');
        var t = c.querySelector('[data-size-toggle]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
