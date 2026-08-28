# Blog Constructor v2 — План реализации

## Стек
**Vue 3 + Vite** (SPA, без бэкенда). Открывается как статичное приложение — `npm run dev` для разработки, `npm run build` для сборки в `dist/`.

---

## Схема JSON статьи

```json
{
  "id": 1,
  "code": "slug-article",
  "category": { "id": 0, "code": 0, "name": "Коллекции" },
  "name": "Название статьи",
  "author": "Автор (опционально)",
  "tag": "тег",
  "date": "28.08.2026",
  "attachments": {
    "bigImg": "https://...",
    "mediumImg": "https://...",
    "smallImg": "https://...",
    "latestImg": "https://...",
    "mainImg": "https://...",
    "headerImg": "https://..."
  },
  "content": [
    { "type": "text", "content": "<p>HTML...</p>" },
    { "type": "image", "image": { "url": "https://...", "alt": "...", "text": "...", "link": "..." } },
    { "type": "image-slider", "images": ["https://...", "https://..."] },
    { "type": "products-slider", "products": [123, 456] },
    { "type": "products-text", "products": [123, 456] },
    {
      "type": "columns",
      "items": [
        [ { "type": "image", "image": { "url": "https://..." } } ],
        [ { "type": "text", "content": "<p>...</p>" } ]
      ]
    }
  ]
}
```

### Поле `gender` на блоке
Любой блок может иметь `"gender": "w"` или `"gender": "m"` — тогда он показывается только нужному полу. Если `null` / отсутствует — показывается всем.

### Примечание по `image-slider`
Компонент `ImagesList` принимает `images: string[]` — только URL-ы. Alt в JSON не хранится. В конструкторе поле alt есть для удобства редактора, но в генерируемый JSON не попадает.

---

## Категории

| value | name |
|-------|------|
| 0 | Коллекции |
| 1 | Новости |
| 2 | SALE |
| 3 | Интервью |
| 4 | Акция |
| 5 | Beauty |

---

## Layout приложения

```
┌─────────────────────────────────────────────────────┐
│  Blog Constructor v2                    [Import JSON]│
├──────────────────────────┬──────────────────────────┤
│  EDITOR                  │  PREVIEW                  │
│  ┌──────────────────┐   │  [Article as rendered]    │
│  │ Meta (category,  │   │                           │
│  │ name, date...)   │   │                           │
│  ├──────────────────┤   │                           │
│  │ Attachments      │   │                           │
│  ├──────────────────┤   │                           │
│  │ Content Blocks   │   │                           │
│  │ [≡] text block   │   │                           │
│  │ [≡] image block  │   │                           │
│  │ [+] Add Block    │   │                           │
│  └──────────────────┘   │                           │
│  [Generate] [Copy] [↓]  │                           │
└──────────────────────────┴──────────────────────────┘
```

---

## Task Breakdown

### Task 1: Инициализация проекта Vite + Vue 3
- **Objective:** Создать проект с Vite + Vue 3, настроить структуру папок, базовый layout
- **Implementation:**
  - `npm create vite@latest . -- --template vue` в папке `blog-constructor-2`
  - Удалить boilerplate, настроить структуру `src/`: `components/`, `composables/`, `stores/`, `utils/`
  - Установить зависимости: `vue-draggable-plus`, `@vueuse/core`, `pinia`
  - Базовый двухколоночный layout (editor | preview)
  - `vite.config` с `base: './'` для работы как файл без сервера
- **Demo:** `npm run dev` открывает приложение с хедером "Blog Constructor v2"

---

### Task 2: Хранилище состояния статьи (Pinia store)
- **Objective:** Реактивное состояние всей статьи — meta + blocks
- **Implementation:**
  - Pinia store `useArticleStore` с объектом `article` (все поля IArticle)
  - Actions: `addBlock`, `removeBlock`, `moveBlock`, `duplicateBlock`, `importFromJson`, `exportToJson`
  - Категории как константа
  - Блоки хранятся с внутренним `_id` (UUID) для drag-and-drop — в JSON не попадает
  - `exportToJson`: убирает `_id`, `gender: null` не включается, `image-slider` даёт `string[]`
- **Tests:** unit-тест на `exportToJson` — проверить что `_id` блоков не попадают в output, `image-slider` корректен
- **Demo:** в Vue DevTools видно реактивное состояние store

---

### Task 3: Форма мета-данных статьи
- **Objective:** Заполнение верхней части: id, code, category, name, author, tag, date, attachments
- **Implementation:**
  - Компонент `MetaForm.vue`
  - Date-picker с автоконвертацией в `dd.mm.yyyy`
  - Attachments — 6 полей URL с tooltip-подсказками о назначении каждой картинки (где используется bigImg, где smallImg и т.д.)
  - Inline-валидация: required поля подсвечиваются при попытке экспорта
- **Demo:** заполнить мета-форму, данные обновляются в store в реальном времени

---

### Task 4: Система блоков — базовые типы (text, image)
- **Objective:** Редакторы для `text` и `image` блоков
- **Implementation:**
  - `BlockEditor.vue` — обёртка с хедером (тип, gender-selector, drag handle, кнопки duplicate/delete)
  - `TextBlockEditor.vue` — textarea с toolbar для быстрой вставки HTML-снипетов:
    - Кнопки: `<p>`, `<h2>`, `<h3>`, `<p class="bold">`, `<p class="center">`, `<p class="gold">`, `<p class="italic">`, `<p class="uppercase">`, `<a href="">`, `<ul><li>`, `.article__vip` цитата, промо-блок `.article__promo`
  - `ImageBlockEditor.vue` — поля: url, alt, text, link
- **Demo:** добавить text и image блоки, заполнить, увидеть корректный JSON

---

### Task 5: Блоки image-slider, products-slider, products-text
- **Objective:** Редакторы для оставшихся простых блоков
- **Implementation:**
  - `ImageSliderEditor.vue` — динамический список URL-полей (add/remove/reorder), alt-поле рядом с URL (только в UI, в JSON не идёт)
  - `ProductsSliderEditor.vue` — список числовых полей product ID (add/remove)
  - `ProductsTextEditor.vue` — аналогично products-slider
- **Demo:** слайдер с 3 картинками и products-slider с 5 ID генерируют корректный JSON

---

### Task 6: Блок columns (двухколоночный layout)
- **Objective:** Поддержка `columns` блока — два столбца с вложенными блоками
- **Implementation:**
  - `ColumnsBlockEditor.vue` — два sub-редактора side by side
  - Каждая колонка поддерживает блоки типов `text` и `image` (не `columns` внутри `columns`)
  - Drag-and-drop внутри каждой колонки
- **Demo:** columns блок с картинкой слева и текстом справа → корректный JSON `items: [[...], [...]]`

---

### Task 7: Drag-and-drop и управление блоками
- **Objective:** Переупорядочивание блоков контента через перетаскивание
- **Implementation:**
  - `vue-draggable-plus` на списке блоков
  - Drag handle (`≡`) на каждом блоке
  - Кнопки ↑/↓ как fallback
  - `duplicateBlock` — клонировать блок с новым `_id`
  - Визуальный индикатор drop-зоны
- **Demo:** перетащить блок на другую позицию — порядок отражается в JSON

---

### Task 8: Live preview панель
- **Objective:** Правая панель показывает статью приближённо к реальному виду
- **Implementation:**
  - `PreviewPane.vue` — рендерит мета (заголовок, дата, автор, категория) и блоки
  - Стили близкие к реальному сайту (тот же шрифт Inter, размеры, цвета)
  - `text` — `v-html`
  - `image` — `<img>` тег
  - `image-slider` — простая галерея (без Swiper, только стрелки)
  - `products-slider` / `products-text` — заглушка с ID-ами (реальные товары не грузим)
  - `columns` — flex layout
  - Переключатель гендера в preview (w / m / all) для проверки gender-фильтра
- **Demo:** при редактировании любого поля превью обновляется мгновенно

---

### Task 9: Import/Export и финальный UX
- **Objective:** Загрузка существующего JSON, копирование и скачивание результата
- **Implementation:**
  - Кнопка "Импорт JSON" — модалка с textarea + drag-and-drop `.json` файла, парсинг через `importFromJson`
  - Валидация при export — подсветить все незаполненные required поля, скроллить к первому
  - "Скопировать JSON" — clipboard API + toast уведомление
  - "Скачать .json" — Blob download, имя файла = `code` статьи
  - LocalStorage автосохранение через `@vueuse/core useStorage` каждые 2 сек
  - При открытии: "Черновик восстановлен от [дата]" с кнопкой "Очистить"
- **Demo:** заполнить статью → закрыть вкладку → открыть снова → черновик восстановился. Импорт JSON → редактирование → скачать

---

### Task 10: Полировка и финальная сборка
- **Objective:** UX детали, стили, финальный `npm run build`
- **Implementation:**
  - Keyboard shortcuts: `Ctrl+S` — копировать JSON, поддержка `Ctrl+Z` для отмены удаления блока (history стек)
  - Адаптивность — на узком экране preview скрывается, появляется кнопка "Preview"
  - Блок-счётчик ("5 блоков"), индикатор несохранённых изменений в заголовке
  - `npm run build` → `dist/index.html` открывается как файл без сервера
- **Demo:** полный workflow от пустой формы до скачанного JSON, включая импорт существующей статьи и редактирование

---

## Зависимости

| Пакет | Версия | Назначение |
|-------|--------|------------|
| vue | ^3.x | UI framework |
| vite | ^6.x | Build tool |
| pinia | ^2.x | State management |
| vue-draggable-plus | ^0.x | Drag-and-drop |
| @vueuse/core | ^12.x | clipboard, useStorage |
