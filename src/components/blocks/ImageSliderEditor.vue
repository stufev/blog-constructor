<template>
  <div class="slider-editor">
    <VueDraggable v-model="block.items" handle=".item-handle" :animation="150" class="items-list">
      <div v-for="(item, i) in block.items" :key="item._id" class="slider-item">
        <button type="button" class="item-handle" title="Перетащить">⠿</button>
        <div class="item-fields">
          <input
            v-model="item.url"
            type="url"
            class="form-input"
            placeholder="https://cdn.vipavenue.ru/..."
            @input="store.markDirty()"
          />
          <input
            v-model="item._alt"
            type="text"
            class="form-input form-input--alt"
            placeholder="ALT (только в редакторе)"
            @input="store.markDirty()"
          />
        </div>
        <div v-if="item.url" class="item-thumb">
          <img :src="item.url" :alt="item._alt || ''" />
        </div>
        <button type="button" class="item-remove" title="Удалить" @click="removeItem(i)">×</button>
      </div>
    </VueDraggable>

    <div v-if="!block.items.length" class="empty-hint">
      Нет изображений. Нажмите «Добавить» чтобы начать.
    </div>

    <button type="button" class="btn-add" @click="addItem">
      + Добавить изображение
    </button>
  </div>
</template>

<script setup>
import { VueDraggable } from 'vue-draggable-plus'
import { useArticleStore } from '@/stores/article.js'
import { uuid } from '@/utils/index.js'

const props = defineProps({
  block: { type: Object, required: true },
})

const store = useArticleStore()

function addItem() {
  props.block.items.push({ _id: uuid(), url: '', _alt: '' })
  store.markDirty()
}

function removeItem(index) {
  props.block.items.splice(index, 1)
  store.markDirty()
}
</script>

<style scoped>
.slider-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px;
}

.item-handle {
  cursor: grab;
  font-size: 16px;
  color: var(--text-muted);
  background: none;
  border: none;
  padding: 0 4px;
  line-height: 1;
  flex-shrink: 0;
}

.item-handle:active {
  cursor: grabbing;
}

.item-fields {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.form-input {
  padding: 7px 9px;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 12px;
  font-family: inherit;
  color: var(--text);
  background: var(--bg);
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-input--alt {
  font-style: italic;
  color: var(--text-muted);
}

.item-thumb {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--danger);
  color: #fff;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.item-remove:hover {
  opacity: 0.8;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 12px;
}

.btn-add {
  font-size: 13px;
  padding: 7px 14px;
  border: 1px dashed var(--accent);
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  align-self: flex-start;
}

.btn-add:hover {
  background: var(--accent);
  color: #fff;
}
</style>
