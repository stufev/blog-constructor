<template>
  <div class="preview-pane">
    <div class="preview-toolbar">
      <span class="preview-label">Превью</span>
      <div class="gender-toggle">
        <button
          v-for="opt in genderOpts"
          :key="String(opt.value)"
          type="button"
          class="gender-btn"
          :class="{ 'gender-btn--active': previewGender === opt.value }"
          @click="previewGender = opt.value"
        >{{ opt.label }}</button>
      </div>
    </div>

    <div class="preview-scroll">
      <article class="preview-article">
        <!-- Мета -->
        <div v-if="category?.name" class="preview-category">{{ category.name }}</div>
        <h1 v-if="meta.name" class="preview-title" v-html="meta.name" />
        <div v-if="meta.author" class="preview-author">{{ meta.author }}</div>
        <div v-if="meta.date" class="preview-date">{{ meta.date }}</div>

        <div v-if="meta.attachments.headerImg" class="preview-header-img">
          <img :src="meta.attachments.headerImg" alt="Header" />
        </div>

        <!-- Контент -->
        <div v-if="visibleBlocks.length" class="preview-content">
          <template v-for="block in visibleBlocks" :key="block._id">
            <!-- columns -->
            <div v-if="block.type === 'columns'" class="preview-columns">
              <div v-for="(col, ci) in block.items" :key="ci" class="preview-col">
                <template v-for="sub in col" :key="sub._id">
                  <div v-if="sub.type === 'text'" class="preview-text" v-html="sub.content" />
                  <div v-else-if="sub.type === 'image' && sub.image?.url" class="preview-image">
                    <img :src="sub.image.url" :alt="sub.image.alt || ''" />
                    <p v-if="sub.image.text">{{ sub.image.text }}</p>
                  </div>
                </template>
              </div>
            </div>

            <!-- text -->
            <div v-else-if="block.type === 'text'" class="preview-text" v-html="block.content" />

            <!-- image -->
            <div v-else-if="block.type === 'image' && block.image?.url" class="preview-image">
              <component
                :is="block.image.link ? 'a' : 'div'"
                :href="block.image.link || undefined"
                target="_blank"
              >
                <img :src="block.image.url" :alt="block.image.alt || ''" />
              </component>
              <p v-if="block.image.text">{{ block.image.text }}</p>
            </div>

            <!-- image-slider -->
            <div v-else-if="block.type === 'image-slider' && block.items?.length" class="preview-slider">
              <div class="preview-slider__track" :style="{ transform: `translateX(-${sliderIndex(block._id) * 100}%)` }">
                <div
                  v-for="(item, si) in block.items"
                  :key="si"
                  class="preview-slider__slide"
                >
                  <img v-if="item.url" :src="item.url" :alt="item._alt || `Slide ${si + 1}`" />
                  <div v-else class="preview-slider__placeholder">Нет URL</div>
                </div>
              </div>
              <div v-if="block.items.length > 1" class="preview-slider__controls">
                <button type="button" @click="sliderPrev(block._id, block.items.length)">←</button>
                <span>{{ sliderIndex(block._id) + 1 }} / {{ block.items.length }}</span>
                <button type="button" @click="sliderNext(block._id, block.items.length)">→</button>
              </div>
            </div>

            <!-- products-slider -->
            <div v-else-if="block.type === 'products-slider'" class="preview-products-stub">
              <div class="stub-label">🛍 Слайдер товаров</div>
              <div class="stub-ids">
                ID: {{ (block.products || []).filter(Boolean).join(', ') || '—' }}
              </div>
            </div>

            <!-- products-text -->
            <div v-else-if="block.type === 'products-text'" class="preview-products-stub preview-products-stub--text">
              <div class="stub-label">📝 Товары текстом</div>
              <div class="stub-ids">
                ID: {{ (block.products || []).filter(Boolean).join(', ') || '—' }}
              </div>
            </div>

            <div v-else-if="!['text','image','image-slider','products-slider','products-text','columns'].includes(block.type)" class="preview-unknown">
              Неизвестный тип: {{ block.type }}
            </div>
          </template>
        </div>

        <div v-else-if="!meta.name && !meta.attachments.headerImg" class="preview-empty">
          <span>Заполните форму слева — превью появится здесь</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useArticleStore } from '@/stores/article.js'

const store = useArticleStore()
const { meta, blocks, category } = storeToRefs(store)

const genderOpts = [
  { value: null, label: 'Все' },
  { value: 'w', label: '♀' },
  { value: 'm', label: '♂' },
]

const previewGender = ref(null)

const visibleBlocks = computed(() => {
  return blocks.value.filter((b) => {
    if (!b.gender || previewGender.value === null) return true
    return b.gender === previewGender.value
  })
})

// Простой слайдер-контроллер (индексы по _id блока)
const sliderIndexes = ref({})

function sliderIndex(id) {
  return sliderIndexes.value[id] || 0
}

function sliderNext(id, total) {
  sliderIndexes.value[id] = ((sliderIndexes.value[id] || 0) + 1) % total
}

function sliderPrev(id, total) {
  sliderIndexes.value[id] = ((sliderIndexes.value[id] || 0) - 1 + total) % total
}
</script>

<style scoped>
.preview-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--preview-bg);
  border-left: 1px solid var(--border);
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.preview-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.gender-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 2px;
}

.gender-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s;
}

.gender-btn--active {
  background: var(--accent);
  color: #fff;
}

.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
}

.preview-article {
  max-width: 640px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, sans-serif;
  color: #222;
}

.preview-category {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 12px;
  color: #555;
}

.preview-title {
  font-size: 26px;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
  line-height: 1.25;
}

.preview-author,
.preview-date {
  font-size: 12px;
  text-align: center;
  color: #888;
  margin-bottom: 6px;
}

.preview-header-img {
  margin-top: 20px;
  margin-bottom: 8px;
}

.preview-header-img img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Контент */
.preview-content {
  padding-top: 20px;
}

/* text */
.preview-text {
  margin-bottom: 32px;
  font-size: 15px;
  line-height: 1.6;
}

.preview-text :deep(p) {
  margin-bottom: 20px;
  font-size: 15px;
  line-height: 1.5;
}
.preview-text :deep(h2) { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.preview-text :deep(h3) { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.preview-text :deep(h4) { font-size: 15px; font-weight: 600; margin-bottom: 10px; }
.preview-text :deep(.bold) { font-weight: 700; }
.preview-text :deep(.center) { text-align: center; }
.preview-text :deep(.italic) { font-style: italic; }
.preview-text :deep(.uppercase) { text-transform: uppercase; }
.preview-text :deep(.gold) { color: #c9a85c; font-weight: 500; }
.preview-text :deep(.semi-bold) { font-weight: 600; }
.preview-text :deep(a) { color: #c9a85c; font-weight: 600; }
.preview-text :deep(ul) { list-style: none; margin-bottom: 20px; }
.preview-text :deep(li) { padding-left: 20px; margin-bottom: 12px; font-size: 15px; position: relative; }
.preview-text :deep(li)::before { content: ''; position: absolute; left: 8px; top: 10px; width: 4px; height: 4px; background: #222; border-radius: 50%; }
.preview-text :deep(.article__vip) { font-size: 28px; line-height: 1.6; text-align: center; color: #c9a85c; margin-bottom: 32px; }
.preview-text :deep(.article__promo) { padding: 20px; border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: center; margin-bottom: 32px; }
.preview-text :deep(.article__promo-title) { font-size: 16px; font-weight: 500; margin-bottom: 16px; }
.preview-text :deep(.article__promo-btn) { display: inline-flex; align-items: center; justify-content: center; min-width: 180px; height: 44px; padding: 0 16px; border: 1px solid #babbc1; border-radius: 3px; font-size: 14px; text-transform: uppercase; color: #222; text-decoration: none; }
.preview-text :deep(.article__btn) { display: inline-flex; align-items: center; justify-content: center; min-width: 200px; height: 46px; padding: 0 20px; background: #2a2a2a; border-radius: 3px; color: #fff; font-size: 14px; text-transform: uppercase; text-decoration: none; margin-bottom: 32px; }
.preview-text :deep(.article__video) { position: relative; padding-bottom: 56%; height: 0; margin-bottom: 32px; }
.preview-text :deep(.article__video) iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

/* image */
.preview-image {
  margin-bottom: 32px;
}
.preview-image a { display: block; }
.preview-image img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 2px;
}
.preview-image p {
  font-size: 13px;
  text-align: center;
  text-transform: uppercase;
  margin-top: 10px;
  color: #555;
}

/* slider */
.preview-slider {
  margin-bottom: 32px;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
}

.preview-slider__track {
  display: flex;
  transition: transform 0.3s ease;
}

.preview-slider__slide {
  min-width: 100%;
  flex-shrink: 0;
}

.preview-slider__slide img {
  display: block;
  width: 100%;
  height: auto;
}

.preview-slider__placeholder {
  width: 100%;
  height: 160px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-muted);
}

.preview-slider__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}

.preview-slider__controls button {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
}

.preview-slider__controls button:hover {
  background: var(--border);
}

.preview-slider__controls span {
  font-size: 12px;
  color: var(--text-muted);
}

/* products stub */
.preview-products-stub {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px dashed var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  text-align: center;
}

.preview-products-stub--text {
  border-style: dotted;
}

.stub-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.stub-ids {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'Courier New', monospace;
}

/* columns */
.preview-columns {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 13px;
  line-height: 1.4;
}

.preview-col {
  flex: 1;
  min-width: 0;
}

.preview-col .preview-text {
  font-size: 13px;
  margin-bottom: 8px;
}

.preview-col .preview-image {
  margin-bottom: 8px;
}

/* unknown */
.preview-unknown {
  padding: 8px 12px;
  background: #fff3cd;
  border-radius: 4px;
  font-size: 12px;
  color: #856404;
  margin-bottom: 16px;
}

/* empty */
.preview-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
