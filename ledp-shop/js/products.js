/* ============================================================
   products.js — единый каталог товаров.

   Это ЕДИНСТВЕННОЕ место, где хранятся название, цена и картинки.
   Витрина (shop.js), страница товара (product.js) и корзина
   (cart.js) берут данные отсюда, поэтому цена в карточке,
   на странице товара и в корзине больше не могут разойтись.

   Чтобы добавить товар — допишите объект в массив ниже.
   Пути к картинкам указываются относительно папки pages/.
   ============================================================ */

window.PRODUCTS = [
  {
    id: '1',
    name: 'DÉFUNT LONGSLEEVE',
    price: 3800,
    image: 'images/cloth1.webp',
    hover: 'images/cloth1-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Лонгслив премиум-качества из плотного хлопка. Печать выполнена вручную, ' +
      'поэтому каждая вещь немного отличается от соседней. Свободная посадка, ' +
      'заниженная линия плеча.',
    composition: '100% хлопок, плотность 240 г/м²',
    care: 'Стирка при 30 °C, не отбеливать, гладить с изнаночной стороны'
  },
  {
    id: '2',
    name: 'HOODIE DARTS',
    price: 4100,
    image: 'images/cloth2.webp',
    hover: 'images/cloth2-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Худи оверсайз с мягким начёсом внутри. Капюшон на двойном слое, ' +
      'манжеты и низ на широкой резинке.',
    composition: '80% хлопок, 20% полиэстер, плотность 340 г/м²',
    care: 'Стирка при 30 °C, сушить в расправленном виде'
  },
  {
    id: '3',
    name: 'HOODIE HEAVEN',
    price: 4100,
    image: 'images/cloth3.webp',
    hover: 'images/cloth3-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Худи с крупной печатью на спине. Классическая посадка, плотное полотно, ' +
      'которое не вытягивается после стирки.',
    composition: '80% хлопок, 20% полиэстер, плотность 340 г/м²',
    care: 'Стирка при 30 °C, не сушить в машине'
  },
  {
    id: '4',
    name: 'HOODIE M',
    price: 4100,
    image: 'images/cloth4.webp',
    hover: 'images/cloth4-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Минималистичное худи без лишних деталей. Подойдёт как базовая вещь ' +
      'на каждый день.',
    composition: '80% хлопок, 20% полиэстер, плотность 320 г/м²',
    care: 'Стирка при 30 °C, гладить при средней температуре'
  },
  {
    id: '5',
    name: 'HOODIE OVER',
    price: 4100,
    image: 'images/cloth5.webp',
    hover: '',
    sizes: ['S', 'M', 'L'],
    description:
      'Худи подчёркнуто свободного кроя: приспущенное плечо, объёмный капюшон, ' +
      'удлинённый рукав.',
    composition: '80% хлопок, 20% полиэстер, плотность 340 г/м²',
    care: 'Стирка при 30 °C, сушить в расправленном виде'
  },
  {
    id: '6',
    name: 'BAG',
    price: 2700,
    image: 'images/cloth6.webp',
    hover: 'images/cloth6-alt.webp',
    sizes: [],
    description:
      'Сумка-шоппер из плотного хлопка с длинными ручками. Один размер, ' +
      'внутренний карман на молнии.',
    composition: '100% хлопок, плотность 280 г/м²',
    care: 'Ручная стирка при 30 °C'
  },
  {
    id: '7',
    name: 'SHIRT',
    price: 2700,
    image: 'images/cloth7.webp',
    hover: 'images/cloth7-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Рубашка прямого кроя из хлопка с лёгкой фактурой. Перламутровые пуговицы, ' +
      'скруглённый низ.',
    composition: '100% хлопок',
    care: 'Стирка при 30 °C, гладить влажной'
  },
  {
    id: '8',
    name: 'HOODIE',
    price: 4500,
    image: 'images/cloth8.webp',
    hover: 'images/cloth8-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Тяжёлое худи из плотного футера. Держит форму, не растягивается, ' +
      'садится ровно по фигуре.',
    composition: '85% хлопок, 15% полиэстер, плотность 400 г/м²',
    care: 'Стирка при 30 °C, не отбеливать'
  },
  {
    id: '9',
    name: 'T-SHIRT CROSS',
    price: 2500,
    image: 'images/cloth9.webp',
    hover: 'images/cloth9-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Футболка из плотного хлопка с печатью на груди. Прямой силуэт, ' +
      'усиленная горловина.',
    composition: '100% хлопок, плотность 220 г/м²',
    care: 'Стирка при 30 °C, гладить с изнаночной стороны'
  },
  {
    id: '10',
    name: 'HOODIE DARK',
    price: 3800,
    image: 'images/cloth10.webp',
    hover: 'images/cloth10-alt.webp',
    sizes: ['S', 'M', 'L'],
    description:
      'Тёмное худи с контрастной печатью. Тот же крой, что и у HOODIE DARTS, ' +
      'но в более спокойной палитре.',
    composition: '80% хлопок, 20% полиэстер, плотность 340 г/м²',
    care: 'Стирка при 30 °C, сушить в расправленном виде'
  }
];

/* Быстрый поиск товара по id — используется во всех остальных скриптах. */
window.findProduct = function (id) {
  var wanted = String(id);
  for (var i = 0; i < window.PRODUCTS.length; i++) {
    if (String(window.PRODUCTS[i].id) === wanted) return window.PRODUCTS[i];
  }
  return null;
};
