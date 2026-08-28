<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Импорт JSON</span>
        <button type="button" class="modal-close" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <p class="modal-hint">
          Вставьте JSON статьи или перетащите <code>.json</code> файл в поле ниже.
        </p>

        <div
          class="drop-zone"
          :class="{ 'drop-zone--over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="onDrop"
        >
          <textarea
            v-model="jsonText"
            class="json-textarea"
            placeholder='{"id": 1, "code": "...", ...}'
            spellcheck="false"
          />
          <div v-if="isDragOver" class="drop-overlay">Отпустите файл здесь</div>
        </div>

        <div v-if="error" class="import-error">{{ error }}</div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn--secondary" @click="emit('close')">Отмена</button>
        <button type="button" class="btn btn--primary" :disabled="!jsonText.trim()" @click="doImport">
          Загрузить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useArticleStore } from '@/stores/article.js'

const emit = defineEmits(['close', 'imported'])
const store = useArticleStore()

const jsonText = ref('')
const error = ref('')
const isDragOver = ref(false)

function onDrop(e) {
  isDragOver.value = false
  const file = e.dataTransfer.files?.[0]
  if (!file) return
  if (!file.name.endsWith('.json')) {
    error.value = 'Файл должен быть .json'
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    jsonText.value = ev.target.result
    error.value = ''
  }
  reader.readAsText(file)
}

function doImport() {
  error.value = ''
  try {
    store.importFromJson(jsonText.value)
    emit('imported')
    emit('close')
  } catch (e) {
    error.value = `Ошибка парсинга: ${e.message}`
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--bg);
  border-radius: 10px;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 15px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.1s;
}

.modal-close:hover {
  color: var(--danger);
}

.modal-body {
  padding: 16px 20px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.modal-hint code {
  background: var(--bg-secondary);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.drop-zone {
  position: relative;
  border: 2px dashed var(--border);
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  min-height: 280px;
  transition: border-color 0.15s;
}

.drop-zone--over {
  border-color: var(--accent);
}

.json-textarea {
  width: 100%;
  height: 100%;
  min-height: 280px;
  padding: 12px;
  border: none;
  background: transparent;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text);
  resize: none;
  box-sizing: border-box;
}

.json-textarea:focus {
  outline: none;
}

.drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--accent-rgb), 0.12);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
  pointer-events: none;
}

.import-error {
  font-size: 12px;
  color: var(--danger);
  background: rgba(220, 53, 69, 0.08);
  padding: 8px 12px;
  border-radius: 5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn--secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn--secondary:hover {
  border-color: var(--text-secondary);
}

.btn--primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  opacity: 0.88;
}

.btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
