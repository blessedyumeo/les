/* ============================================================
   app.js — общие элементы страниц магазина: прелоадер и слайдер.

   Что изменилось: раньше файл падал с ошибкой на страницах без
   слайдера (items[active] у пустого списка, next.onclick у null).
   Из-за упавшего скрипта переставали работать и прелоадер, и
   подмена картинок. Теперь каждый блок проверяет, что элементы
   вообще есть на странице.

   Слайдер переехал со «стопки картинок на JS» на нативный
   scroll-snap: он работает свайпом на телефоне, не ломается при
   изменении размера окна и не требует пересчёта координат.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Прелоадер ---------- */
  function initPreloader() {
    var preloader = document.querySelector('.preloader');
    if (!preloader) return;

    function hide() {
      preloader.classList.add('is-hidden');
      window.setTimeout(function () { preloader.remove(); }, 600);
    }

    // Прячем после загрузки, но не дольше 2.5 с — чтобы одна
    // тяжёлая картинка не держала пользователя на заглушке.
    window.addEventListener('load', function () {
      window.setTimeout(hide, 400);
    });
    window.setTimeout(hide, 2500);
  }

  /* ---------- Слайдер на scroll-snap ---------- */
  function initSlider() {
    var slider = document.querySelector('[data-slider]');
    if (!slider) return;

    var track = slider.querySelector('[data-slider-track]');
    var prev = slider.querySelector('[data-slider-prev]');
    var next = slider.querySelector('[data-slider-next]');
    if (!track) return;

    function step() {
      var first = track.querySelector('.slide');
      if (!first) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function scrollBy(direction) {
      track.scrollBy({ left: direction * step(), behavior: 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { scrollBy(-1); });
    if (next) next.addEventListener('click', function () { scrollBy(1); });

    function syncArrows() {
      var max = track.scrollWidth - track.clientWidth - 1;
      if (prev) prev.disabled = track.scrollLeft <= 0;
      if (next) next.disabled = track.scrollLeft >= max;
    }

    track.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    syncArrows();

    // Автопрокрутка, которая останавливается при взаимодействии
    // и не мешает тем, кто просит уменьшить анимацию.
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    var timer = window.setInterval(function () {
      var max = track.scrollWidth - track.clientWidth - 1;
      if (track.scrollLeft >= max) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollBy(1);
      }
    }, 5000);

    ['pointerdown', 'wheel', 'touchstart'].forEach(function (evt) {
      slider.addEventListener(evt, function () { window.clearInterval(timer); }, { passive: true, once: true });
    });
  }

  /* ---------- Тень у шапки при прокрутке ---------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function init() {
    initPreloader();
    initSlider();
    initHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
