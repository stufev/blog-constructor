<template>
  <div class="products-editor">
    <div class="products-list">
      <div v-for="(_, i) in block.products" :key="i" class="product-item">
        <span class="product-num">{{ i + 1 }}</span>
        <input
          v-model.number="block.products[i]"
          type="number"
          class="form-input"
          placeholder="ID товара"
          min="1"
          @input="store.markDirty()"
        />
        <button type="button" class="item-remove" title="Удалить" @click="removeItem(i)">×</button>
      </div>
    </div>

    <div v-if="!block.products.length" class="empty-hint">
      Нет товаров. Нажмите «Добавить» чтобы добавить ID товара.
    </div>

    <div class="footer">
      <button type="button" class="btn-add" @click="addItem">
        + Добавить товар
      </button>
      <span v-if="block.products.length" class="count-hint">
        {{ block.products.length }} {{ productWord(block.products.length) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useArticleStore } from '@/stores/article.js'

const props = defineProps({
  block: { type: Object, required: true },
})

const store = useArticleStore()

function addItem() {
  props.block.products.push(null)
  store.markDirty()
}

function removeItem(index) {
  props.block.products.splice(index, 1)
  store.markDirty()
}

function productWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'товар'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'товара'
  return 'товаров'
}
</script>

<style scoped>
.products-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-num {
  font-size: 11px;
  color: var(--text-muted);
  width: 18px;
  text-align: right;
  flex-shrink: 0;
}

.form-input {
  padding: 7px 9px;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text);
  background: var(--bg);
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.item-remove {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--danger);
  color: #fff;
  border: none;
  font-size: 15px;
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
  padding: 8px;
}

.footer {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.btn-add:hover {
  background: var(--accent);
  color: #fff;
}

.count-hint {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
