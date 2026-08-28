<template>
  <div class="image-editor">
    <div class="form-field form-field--required" :class="{ 'form-field--error': !block.image.url && showErrors }">
      <label class="form-label">URL изображения <span class="req">*</span></label>
      <input
        v-model="block.image.url"
        type="url"
        class="form-input"
        placeholder="https://cdn.vipavenue.ru/..."
        @input="store.markDirty()"
      />
    </div>

    <div class="form-row">
      <div class="form-field">
        <label class="form-label">ALT</label>
        <input
          v-model="block.image.alt"
          type="text"
          class="form-input"
          placeholder="Описание для SEO"
          @input="store.markDirty()"
        />
      </div>

      <div class="form-field">
        <label class="form-label">Подпись под изображением</label>
        <input
          v-model="block.image.text"
          type="text"
          class="form-input"
          placeholder="ПЛАТЬЕ GUCCI, 2026"
          @input="store.markDirty()"
        />
      </div>
    </div>

    <div class="form-field">
      <label class="form-label">Ссылка (link) <span class="muted">— изображение станет кликабельным</span></label>
      <input
        v-model="block.image.link"
        type="url"
        class="form-input"
        placeholder="https://vipavenue.ru/..."
        @input="store.markDirty()"
      />
    </div>

    <div v-if="block.image.url" class="image-preview">
      <img :src="block.image.url" :alt="block.image.alt || 'preview'" />
    </div>
  </div>
</template>

<script setup>
import { useArticleStore } from '@/stores/article.js'

defineProps({
  block: { type: Object, required: true },
  showErrors: { type: Boolean, default: false },
})

const store = useArticleStore()
</script>

<style scoped>
.image-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-field {
  flex: 1;
  min-width: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.req { color: var(--accent); }
.muted { color: var(--text-muted); font-weight: 400; }

.form-input {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text);
  background: var(--bg);
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-field--error .form-input {
  border-color: var(--danger);
}

.image-preview {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  max-height: 200px;
}

.image-preview img {
  display: block;
  width: 100%;
  height: 200px;
  object-fit: cover;
}
</style>
