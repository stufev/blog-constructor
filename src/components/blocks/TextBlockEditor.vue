<template>
  <div class="text-editor">
    <div class="toolbar">
      <div v-for="group in HTML_SNIPPETS" :key="group.group" class="toolbar-group">
        <span class="toolbar-group__label">{{ group.group }}</span>
        <button
          v-for="snip in group.items"
          :key="snip.label"
          type="button"
          class="toolbar-btn"
          :title="snip.snippet"
          @click="insertSnippet(snip.snippet)"
        >
          {{ snip.label }}
        </button>
      </div>
    </div>
    <textarea
      ref="textareaRef"
      v-model="block.content"
      class="code-textarea"
      placeholder="<p>Введите HTML-контент...</p>"
      spellcheck="false"
      @input="store.markDirty()"
    />
    <div class="char-count">{{ block.content?.length || 0 }} символов</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useArticleStore } from '@/stores/article.js'
import { HTML_SNIPPETS } from '@/constants/index.js'

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
})

const store = useArticleStore()
const textareaRef = ref(null)

function insertSnippet(snippet) {
  const el = textareaRef.value
  if (!el) {
    props.block.content = (props.block.content || '') + snippet
    return
  }
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = props.block.content || ''
  props.block.content = text.slice(0, start) + snippet + text.slice(end)

  // Позиция курсора:
  // — для парных тегов (<p></p>, <b></b>) — между открывающим и закрывающим
  // — для self-closing (<br/>) и многострочных — после всего снипета
  let cursorPos
  const innerPos = snippet.indexOf('></')
  if (innerPos >= 0) {
    cursorPos = start + innerPos + 1
  } else {
    cursorPos = start + snippet.length
  }

  setTimeout(() => {
    el.focus()
    el.setSelectionRange(cursorPos, cursorPos)
  }, 0)
  store.markDirty()
}
</script>

<style scoped>
.text-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}

.toolbar-group__label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding-right: 3px;
  white-space: nowrap;
}

/* разделитель между группами */
.toolbar-group + .toolbar-group {
  padding-left: 8px;
  border-left: 1px solid var(--border);
}

.toolbar-btn {
  font-size: 11px;
  padding: 3px 7px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: 'Courier New', monospace;
  transition: all 0.1s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.code-textarea {
  width: 100%;
  min-height: 160px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.code-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.char-count {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}
</style>
