export const CATEGORIES = [
  { id: 0, code: 0, name: 'Коллекции' },
  { id: 1, code: 1, name: 'Новости' },
  { id: 2, code: 2, name: 'SALE' },
  { id: 3, code: 3, name: 'Интервью' },
  { id: 4, code: 4, name: 'Акция' },
  { id: 5, code: 5, name: 'Beauty' },
]

export const BLOCK_TYPES = [
  { value: 'text', label: 'Текст (HTML)' },
  { value: 'image', label: 'Изображение' },
  { value: 'image-slider', label: 'Слайдер изображений' },
  { value: 'products-slider', label: 'Слайдер товаров' },
  { value: 'products-text', label: 'Товары текстом' },
  { value: 'columns', label: 'Два столбца' },
]

export const BLOCK_TYPES_FOR_COLUMNS = [
  { value: 'text', label: 'Текст (HTML)' },
  { value: 'image', label: 'Изображение' },
]

export const GENDER_OPTIONS = [
  { value: null, label: 'Все' },
  { value: 'w', label: '♀ Женщины' },
  { value: 'm', label: '♂ Мужчины' },
]

export const ATTACHMENTS_META = {
  bigImg:     { label: 'bigImg',     hint: 'Большой баннер на главной блога (десктоп)' },
  mediumImg:  { label: 'mediumImg',  hint: 'Средний баннер в сетке статей' },
  smallImg:   { label: 'smallImg',   hint: 'Маленькая карточка в списке' },
  latestImg:  { label: 'latestImg',  hint: 'Блок "Последние статьи"' },
  mainImg:    { label: 'mainImg',    hint: 'Главное изображение статьи (OG-image)' },
  headerImg:  { label: 'headerImg',  hint: 'Баннер внутри статьи, над контентом' },
}

export const HTML_SNIPPETS = [
  // Базовые теги
  { group: 'Базовые',
    items: [
      { label: '<p>',           snippet: '<p></p>' },
      { label: '<b>',           snippet: '<b></b>' },
      { label: '<br>',          snippet: '<br/>' },
      { label: '<a href>',      snippet: '<a href=""></a>' },
      { label: '<a target>',   snippet: '<a href="" target="_blank"></a>' },
      { label: '<ul><li>',      snippet: '<ul>\n  <li></li>\n  <li></li>\n</ul>' },
    ]
  },
  // Заголовки
  { group: 'Заголовки',
    items: [
      { label: '<h2>',          snippet: '<h2></h2>' },
      { label: '<h3>',          snippet: '<h3></h3>' },
      { label: '<h4>',          snippet: '<h4></h4>' },
    ]
  },
  // Классы параграфа
  { group: 'p. классы',
    items: [
      { label: '.bold',         snippet: '<p class="bold"></p>' },
      { label: '.center',       snippet: '<p class="center"></p>' },
      { label: '.gold',         snippet: '<p class="gold"></p>' },
      { label: '.italic',       snippet: '<p class="italic"></p>' },
      { label: '.uppercase',    snippet: '<p class="uppercase"></p>' },
      { label: '.semi-bold',    snippet: '<p class="semi-bold"></p>' },
      { label: '.indent',       snippet: '<p class="indent"></p>' },
    ]
  },
  // Спецблоки
  { group: 'Блоки',
    items: [
      { label: '.vip цитата',   snippet: '<div class="article__vip"><p></p></div>' },
      { label: '.promo',        snippet: '<div class="article__promo">\n  <div class="article__promo-title"></div>\n  <a class="article__promo-btn" href=""></a>\n</div>' },
      { label: '<btn>',         snippet: '<a class="article__btn" href=""></a>' },
      { label: '<video>',       snippet: '<div class="article__video">\n  <iframe src="" frameborder="0" allowfullscreen></iframe>\n</div>\n<div class="article__video-mobile">\n  <iframe src="" frameborder="0" allowfullscreen></iframe>\n</div>' },
    ]
  },
]
