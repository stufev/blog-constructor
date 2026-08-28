<template>
  <div class="columns-editor">
    <div class="columns-wrap">
      <div v-for="(col, colIndex) in block.items" :key="colIndex" class="column">
        <div class="column__header">
          <span class="column__label">Столбец {{ colIndex + 1 }}</span>
        </div>

        <VueDraggable
          v-model="block.items[colIndex]"
          :group="`columns-${block._id}`"
          handle=".col-block-handle"
          :animation="150"
          class="column__blocks"
        >
          <div
            v-for="(subBlock, subIndex) in col"
            :key="subBlock._id"
            class="col-block"
          >
            <div class="col-block__header">
              <button type="button" class="col-block-handle" title="Перетащить">⠿</button>
              <span class="col-block__type-badge">{{ subBlock.type }}</span>
              <button
                type="button"
                class="col-block__remove"
                title="Удалить"
                @click="removeSubBlock(colIndex, subIndex)"
              >×</button>
            </div>

            <div class="col-block__body">
              <TextBlockEditor v-if="subBlock.type === 'text'" :block="subBlock" />
              <ImageBlockEditor v-else-if="subBlock.type === 'image'" :block="subBlock" />
            </div>
          </div>
        </VueDraggable>

        <div v-if="!col.length" class="column__empty">Столбец пуст</div>

        <div class="column__add">
          <button
            v-for="t in BLOCK_TYPES_FOR_COLUMNS"
            :key="t.value"
            type="button"
            class="btn-add-sub"
            @click="addSubBlock(colIndex, t.value)"
          >
            + {{ t.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VueDraggable } from 'vue-draggable-plus'
import { useArticleStore } from '@/stores/article.js'
import { BLOCK_TYPES_FOR_COLUMNS } from '@/constants/index.js'
import { makeColumnBlock } from '@/stores/article.js'
import TextBlockEditor from './TextBlockEditor.vue'
import ImageBlockEditor from './ImageBlockEditor.vue'

const props = defineProps({
  block: { type: Object, required: true },
})

const store = useArticleStore()

function addSubBlock(colIndex, type) {
  props.block.items[colIndex].push(makeColumnBlock(type))
  store.markDirty()
}

function removeSubBlock(colIndex, subIndex) {
  props.block.items[colIndex].splice(subIndex, 1)
  store.markDirty()
}
</script>

<style scoped>
.columns-editor {
  width: 100%;
}

.columns-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.column {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.column__header {
  background: var(--bg-secondary);
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
}

.column__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.column__blocks {
  padding: 8px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column__empty {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 10px;
}

.col-block {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg);
}

.col-block__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.col-block-handle {
  cursor: grab;
  font-size: 14px;
  color: var(--text-muted);
  background: none;
  border: none;
  padding: 0;
  line-height: 1;
}

.col-block-handle:active {
  cursor: grabbing;
}

.col-block__type-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  flex: 1;
}

.col-block__remove {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--danger);
  color: #fff;
  border: none;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.col-block__body {
  padding: 8px;
}

.column__add {
  padding: 8px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-add-sub {
  font-size: 11px;
  padding: 4px 10px;
  border: 1px dashed var(--accent);
  border-radius: 4px;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.btn-add-sub:hover {
  background: var(--accent);
  color: #fff;
}
</style>
