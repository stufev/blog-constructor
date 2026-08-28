<template>
  <div class="block-editor" :class="`block-editor--${block.type}`">
    <!-- Заголовок блока -->
    <div class="block-header">
      <button type="button" class="drag-handle" title="Перетащить для изменения порядка">⠿</button>

      <span class="block-type-badge">{{ blockTypeLabel }}</span>

      <!-- Gender фильтр -->
      <div class="gender-selector">
        <button
          v-for="opt in GENDER_OPTIONS"
          :key="String(opt.value)"
          type="button"
          class="gender-btn"
          :class="{ 'gender-btn--active': block.gender === opt.value }"
          :title="`Показывать: ${opt.label}`"
          @click="setGender(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div class="block-actions">
        <!-- Переместить вверх/вниз -->
        <button
          type="button"
          class="action-btn"
          :disabled="index === 0"
          title="Переместить вверх"
          @click="emit('move', index, index - 1)"
        >↑</button>
        <button
          type="button"
          class="action-btn"
          :disabled="index === total - 1"
          title="Переместить вниз"
          @click="emit('move', index, index + 1)"
        >↓</button>

        <!-- Дублировать -->
        <button
          type="button"
          class="action-btn action-btn--dup"
          title="Дублировать блок"
          @click="emit('duplicate', index)"
        >⧉</button>

        <!-- Добавить блок после -->
        <button
          type="button"
          class="action-btn action-btn--add"
          title="Добавить блок после этого"
          @click="showAddAfter = !showAddAfter"
        >+</button>

        <!-- Удалить -->
        <button
          type="button"
          class="action-btn action-btn--del"
          title="Удалить блок"
          @click="emit('remove', index)"
        >✕</button>
      </div>
    </div>

    <!-- Выпадающий список "добавить блок после" -->
    <div v-if="showAddAfter" class="add-after-menu">
      <span class="add-after-label">Добавить после:</span>
      <button
        v-for="t in BLOCK_TYPES"
        :key="t.value"
        type="button"
        class="add-after-btn"
        @click="addAfter(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Тело блока -->
    <div class="block-body">
      <TextBlockEditor v-if="block.type === 'text'" :block="block" />
      <ImageBlockEditor v-else-if="block.type === 'image'" :block="block" />
      <ImageSliderEditor v-else-if="block.type === 'image-slider'" :block="block" />
      <ProductsEditor v-else-if="block.type === 'products-slider' || block.type === 'products-text'" :block="block" />
      <ColumnsBlockEditor v-else-if="block.type === 'columns'" :block="block" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useArticleStore } from '@/stores/article.js'
import { BLOCK_TYPES, GENDER_OPTIONS } from '@/constants/index.js'
import TextBlockEditor from './blocks/TextBlockEditor.vue'
import ImageBlockEditor from './blocks/ImageBlockEditor.vue'
import ImageSliderEditor from './blocks/ImageSliderEditor.vue'
import ProductsEditor from './blocks/ProductsEditor.vue'
import ColumnsBlockEditor from './blocks/ColumnsBlockEditor.vue'

const props = defineProps({
  block: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['remove', 'duplicate', 'move', 'addAfter'])

const store = useArticleStore()
const showAddAfter = ref(false)

const blockTypeLabel = computed(() => {
  return BLOCK_TYPES.find((t) => t.value === props.block.type)?.label || props.block.type
})

function setGender(value) {
  props.block.gender = value
  store.markDirty()
}

function addAfter(type) {
  emit('addAfter', props.index, type)
  showAddAfter.value = false
}
</script>

<style scoped>
.block-editor {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg);
  transition: box-shadow 0.15s;
}

.block-editor:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Цветовая полоска по типу */
.block-editor--text { border-left: 3px solid #6c8ebf; }
.block-editor--image { border-left: 3px solid #82b366; }
.block-editor--image-slider { border-left: 3px solid #d6a445; }
.block-editor--products-slider { border-left: 3px solid #d45f73; }
.block-editor--products-text { border-left: 3px solid #c792e9; }
.block-editor--columns { border-left: 3px solid #47b8b8; }

.block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.drag-handle {
  cursor: grab;
  font-size: 18px;
  color: var(--text-muted);
  background: none;
  border: none;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.block-type-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  min-width: 80px;
}

.gender-selector {
  display: flex;
  gap: 2px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 2px;
}

.gender-btn {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s;
  white-space: nowrap;
}

.gender-btn--active {
  background: var(--accent);
  color: #fff;
}

.block-actions {
  display: flex;
  gap: 3px;
  margin-left: auto;
}

.action-btn {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  flex-shrink: 0;
}

.action-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.action-btn--dup:hover:not(:disabled) {
  border-color: #6c8ebf;
  color: #6c8ebf;
}

.action-btn--add:hover:not(:disabled) {
  border-color: #82b366;
  color: #82b366;
}

.action-btn--del:hover:not(:disabled) {
  border-color: var(--danger);
  color: var(--danger);
}

/* Add after menu */
.add-after-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.add-after-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  flex-shrink: 0;
}

.add-after-btn {
  font-size: 11px;
  padding: 3px 9px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
}

.add-after-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.block-body {
  padding: 14px;
}
</style>
