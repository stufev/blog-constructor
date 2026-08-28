<template>
  <div class="app" :class="{ 'app--preview-open': showPreview }">
    <!-- Header -->
    <header class="app-header">
      <div class="app-header__left">
        <span class="app-logo">Blog Constructor <span class="app-logo__v">v2</span></span>
        <span v-if="isDirty" class="unsaved-badge" title="Есть несохранённые изменения">●</span>
        <span class="block-count">{{ blockCount }} {{ blockWord(blockCount) }}</span>
      </div>

      <div class="app-header__right">
        <!-- Undo delete -->
        <button
          v-if="deletedHistory.length"
          type="button"
          class="header-btn header-btn--undo"
          title="Отменить удаление блока (Ctrl+Z)"
          @click="undoDelete"
        >
          ↩ Отменить удаление
        </button>

        <!-- Импорт -->
        <button type="button" class="header-btn" @click="showImport = true">
          ↑ Импорт JSON
        </button>

        <!-- Preview toggle (мобайл) -->
        <button
          type="button"
          class="header-btn header-btn--preview-toggle"
          @click="showPreview = !showPreview"
        >
          {{ showPreview ? '✕ Превью' : '👁 Превью' }}
        </button>
      </div>
    </header>

    <!-- Draft notice -->
    <div v-if="draftNotice" class="draft-notice">
      <span>📄 Черновик восстановлен от {{ formatDraftDate(draftSavedAt) }}</span>
      <button type="button" class="draft-clear" @click="clearDraftAndDismiss">Очистить</button>
      <button type="button" class="draft-dismiss" @click="draftNotice = false">✕</button>
    </div>

    <!-- Main layout -->
    <div class="app-body">
      <!-- Editor panel -->
      <div class="editor-panel" :class="{ 'editor-panel--hidden': showPreview }">
        <!-- Meta form -->
        <div class="panel-section">
          <div class="panel-section__head" @click="metaOpen = !metaOpen">
            <span class="panel-section__title">Мета-данные статьи</span>
            <span class="panel-section__toggle">{{ metaOpen ? '▲' : '▼' }}</span>
          </div>
          <div v-show="metaOpen" class="panel-section__body">
            <MetaForm :errors="validationErrors" @clear-error="clearValidationError" />
          </div>
        </div>

        <!-- Blocks -->
        <div class="panel-section panel-section--blocks">
          <div class="panel-section__head">
            <span class="panel-section__title">Блоки контента</span>
          </div>

          <div class="blocks-list-wrap">
            <VueDraggable
              v-model="blocks"
              handle=".drag-handle"
              :animation="200"
              class="blocks-list"
              ghost-class="block-ghost"
            >
              <BlockEditor
                v-for="(block, i) in blocks"
                :key="block._id"
                :block="block"
                :index="i"
                :total="blocks.length"
                @remove="removeBlock"
                @duplicate="duplicateBlock"
                @move="moveBlock"
                @add-after="addBlockAfter"
              />
            </VueDraggable>

            <div v-if="!blocks.length" class="blocks-empty">
              Нет блоков. Добавьте первый блок ниже.
            </div>

            <!-- Add block -->
            <div class="add-block-bar">
              <span class="add-block-label">Добавить блок:</span>
              <button
                v-for="t in BLOCK_TYPES"
                :key="t.value"
                type="button"
                class="add-block-btn"
                :title="t.label"
                @click="addBlock(t.value)"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Export bar -->
        <div class="export-bar">
          <button type="button" class="export-btn export-btn--primary" @click="doCopy">
            📋 Копировать JSON
          </button>
          <button type="button" class="export-btn export-btn--secondary" @click="doDownload">
            ⬇ Скачать .json
          </button>
          <button type="button" class="export-btn export-btn--ghost" @click="doSaveDraft">
            💾 Сохранить черновик
          </button>
        </div>
      </div>

      <!-- Preview panel -->
      <div class="preview-panel" :class="{ 'preview-panel--open': showPreview }">
        <PreviewPane />
      </div>
    </div>

    <!-- Import modal -->
    <ImportModal v-if="showImport" @close="showImport = false" @imported="onImported" />

    <!-- Toast -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { VueDraggable } from 'vue-draggable-plus'
import { useArticleStore } from '@/stores/article.js'
import { BLOCK_TYPES } from '@/constants/index.js'
import MetaForm from '@/components/MetaForm.vue'
import BlockEditor from '@/components/BlockEditor.vue'
import PreviewPane from '@/components/PreviewPane.vue'
import ImportModal from '@/components/ImportModal.vue'
import Toast from '@/components/Toast.vue'

const store = useArticleStore()
const { meta, blocks, isDirty, blockCount, draftSavedAt, deletedHistory, category } = storeToRefs(store)
const { addBlock, removeBlock, duplicateBlock, moveBlock, undoDelete,
        exportToJson, saveDraft, loadDraft, clearDraft, hasDraft, markDirty } = store

const toastRef = ref(null)
const showImport = ref(false)
const showPreview = ref(false)
const draftNotice = ref(false)
const metaOpen = ref(true)

// Validation
const validationErrors = ref({})

function clearValidationError(key) {
  delete validationErrors.value[key]
}

function validateBeforeExport() {
  const errs = {}
  // id и code заполняются бэкендом — не обязательны при редактировании
  if (!meta.value.name) errs.name = 'Обязательное поле'
  if (!meta.value.tag) errs.tag = 'Обязательное поле'
  if (!meta.value.date) errs.date = 'Обязательное поле'
  Object.keys(meta.value.attachments).forEach((k) => {
    if (!meta.value.attachments[k]) errs[`att_${k}`] = 'Обязательное поле'
  })
  validationErrors.value = errs
  if (Object.keys(errs).length) {
    // прокручиваем к первой ошибке
    setTimeout(() => {
      const el = document.querySelector('.form-field--error .form-input, .form-field--error .form-select')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
    }, 50)
    return false
  }
  return true
}

// Export actions
function doCopy() {
  if (!validateBeforeExport()) {
    toastRef.value?.show('Заполните обязательные поля', 'error')
    return
  }
  const json = exportToJson()
  navigator.clipboard.writeText(json)
    .then(() => toastRef.value?.show('JSON скопирован в буфер!'))
    .catch(() => {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = json
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toastRef.value?.show('JSON скопирован в буфер!')
    })
}

function doDownload() {
  if (!validateBeforeExport()) {
    toastRef.value?.show('Заполните обязательные поля', 'error')
    return
  }
  const json = exportToJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${meta.value.code || 'article'}.json`
  a.click()
  URL.revokeObjectURL(url)
  toastRef.value?.show('Файл скачан!')
}

function doSaveDraft() {
  saveDraft()
  toastRef.value?.show('Черновик сохранён')
}

// Blocks
function addBlockAfter(index, type) {
  addBlock(type, index)
}

// Import
function onImported() {
  toastRef.value?.show('JSON импортирован успешно!')
  metaOpen.value = true
}

// Draft
function formatDraftDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return iso
  }
}

function clearDraftAndDismiss() {
  clearDraft()
  draftNotice.value = false
  toastRef.value?.show('Черновик очищен')
}

// Autosave
let autosaveTimer = null

function startAutosave() {
  autosaveTimer = setInterval(() => {
    if (isDirty.value) {
      saveDraft()
    }
  }, 2000)
}

// Keyboard shortcuts
function onKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    doCopy()
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && deletedHistory.value.length) {
    e.preventDefault()
    undoDelete()
    toastRef.value?.show('Блок восстановлен')
  }
}

// Utils
function blockWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'блок'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'блока'
  return 'блоков'
}

onMounted(() => {
  // Load draft
  if (hasDraft()) {
    const savedAt = loadDraft()
    if (savedAt) draftNotice.value = true
  }

  startAutosave()
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  clearInterval(autosaveTimer)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  gap: 12px;
}

.app-header__left,
.app-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-logo {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}

.app-logo__v {
  color: var(--accent);
}

.unsaved-badge {
  color: #e67e22;
  font-size: 16px;
  line-height: 1;
  title: 'Несохранённые изменения';
}

.block-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

.header-btn {
  font-size: 12px;
  padding: 5px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.header-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.header-btn--undo {
  border-color: #e67e22;
  color: #e67e22;
}

.header-btn--undo:hover {
  background: #e67e22;
  color: #fff;
}

.header-btn--preview-toggle {
  display: none;
}

/* Draft notice */
.draft-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  background: #fff8e1;
  border-bottom: 1px solid #ffe082;
  font-size: 13px;
  color: #795548;
  flex-shrink: 0;
}

.draft-clear {
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid #ffe082;
  border-radius: 4px;
  background: transparent;
  color: #795548;
  cursor: pointer;
  font-family: inherit;
}

.draft-clear:hover {
  background: #ffe082;
}

.draft-dismiss {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  font-size: 13px;
  padding: 0 4px;
}

/* Body */
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Editor */
.editor-panel {
  width: 50%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--border);
}

.panel-section {
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.panel-section--blocks {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  background: var(--bg-secondary);
}

.panel-section__head:hover {
  background: var(--bg-hover);
}

.panel-section--blocks .panel-section__head {
  cursor: default;
}

.panel-section__title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.panel-section__toggle {
  font-size: 11px;
  color: var(--text-muted);
}

.panel-section__body {
  padding: 0 16px;
  overflow-y: auto;
  max-height: 340px;
}

.blocks-list-wrap {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.blocks-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

:global(.block-ghost) {
  opacity: 0.4;
  background: var(--accent-light) !important;
}

.blocks-empty {
  text-align: center;
  padding: 32px;
  color: var(--text-muted);
  font-size: 13px;
}

/* Add block bar */
.add-block-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.add-block-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  flex-shrink: 0;
}

.add-block-btn {
  font-size: 11px;
  padding: 4px 10px;
  border: 1px dashed var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
  white-space: nowrap;
}

.add-block-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* Export bar */
.export-bar {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.export-btn {
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.export-btn--primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: #fff;
}

.export-btn--primary:hover {
  opacity: 0.88;
}

.export-btn--secondary {
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.export-btn--secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.export-btn--ghost {
  background: transparent;
  border: 1px dashed var(--border);
  color: var(--text-muted);
}

.export-btn--ghost:hover {
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}

/* Preview panel */
.preview-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Responsive */
@media (max-width: 900px) {
  .editor-panel {
    width: 100%;
  }

  .preview-panel {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 100;
    background: var(--bg);
  }

  .preview-panel--open {
    display: flex;
  }

  .editor-panel--hidden {
    display: none;
  }

  .header-btn--preview-toggle {
    display: inline-flex;
  }
}
</style>
