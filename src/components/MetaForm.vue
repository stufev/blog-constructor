<template>
  <div class="meta-form">

    <!-- 1. Название + slug — самое первое, из него генерируется всё остальное -->
    <section class="section">
      <h3 class="section__title">Статья</h3>

      <div class="form-field" :class="{ 'form-field--error': errors.name }">
        <label class="form-label">Название <span class="req">*</span></label>
        <input
          v-model="meta.name"
          type="text"
          class="form-input"
          placeholder="Эта осень будет тёплой: открытие офиса VIPAVENUE в Краснодаре"
          @input="clearError('name'); markDirty()"
        />
        <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
      </div>

      <div class="form-field">
        <label class="form-label">Code (slug)</label>
        <div class="slug-row">
          <input
            v-model="meta.code"
            type="text"
            class="form-input"
            placeholder="a-warm-autumn-ahead-opening-vipavenue-krasnodar"
            @input="markDirty()"
          />
          <button
            type="button"
            class="slug-btn"
            :class="{ 'slug-btn--loading': slugLoading }"
            :disabled="slugLoading || !meta.name"
            :title="meta.name ? 'Сгенерировать slug из названия' : 'Сначала заполните название'"
            @click="generateSlug"
          >
            <span v-if="slugLoading" class="slug-spinner" />
            <span v-else>⚡ slug</span>
          </button>
        </div>
        <span v-if="slugError" class="form-error">{{ slugError }}</span>
      </div>

      <div class="form-row form-row--3">
        <div class="form-field" :class="{ 'form-field--error': errors.categoryIndex }">
          <label class="form-label">Категория <span class="req">*</span></label>
          <select v-model="meta.categoryIndex" class="form-select" @change="markDirty()">
            <option v-for="(cat, i) in CATEGORIES" :key="cat.id" :value="i">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-field" :class="{ 'form-field--error': errors.tag }">
          <label class="form-label">Тег <span class="req">*</span></label>
          <input
            v-model="meta.tag"
            type="text"
            class="form-input"
            placeholder="VIPAVENUE"
            @input="clearError('tag'); markDirty()"
          />
          <span v-if="errors.tag" class="form-error">{{ errors.tag }}</span>
        </div>

        <div class="form-field" :class="{ 'form-field--error': errors.date }">
          <label class="form-label">Дата <span class="req">*</span></label>
          <div class="date-row">
            <input
              v-model="meta.date"
              type="text"
              class="form-input"
              placeholder="28.08.2026"
              @input="clearError('date'); markDirty()"
            />
            <input
              :value="dateIso"
              type="date"
              class="form-input date-picker"
              title="Выбрать дату"
              @change="onDatePick($event)"
            />
          </div>
          <span v-if="errors.date" class="form-error">{{ errors.date }}</span>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label">Автор <span class="muted">(необязательно)</span></label>
        <input
          v-model="meta.author"
          type="text"
          class="form-input"
          placeholder="Имя автора"
          @input="markDirty()"
        />
      </div>
    </section>

    <!-- 2. Изображения — заливаешь в админку, копируешь ссылки сюда -->
    <section class="section">
      <h3 class="section__title">
        Изображения
        <span class="section__hint">вставьте URL-ы из загруженных фото</span>
      </h3>

      <div class="attachments-grid">
        <div
          v-for="(att, key) in ATTACHMENTS_META"
          :key="key"
          class="form-field"
          :class="{ 'form-field--error': errors[`att_${key}`] }"
        >
          <label class="form-label">
            {{ att.label }}
            <span class="req">*</span>
            <span class="tooltip-wrap">
              <span class="tooltip-icon">?</span>
              <span class="tooltip-text">{{ att.hint }}</span>
            </span>
          </label>
          <input
            v-model="meta.attachments[key]"
            type="url"
            class="form-input"
            placeholder="https://cdn.vipavenue.ru/..."
            @input="clearError(`att_${key}`); markDirty()"
          />
          <div v-if="meta.attachments[key]" class="att-thumb">
            <img :src="meta.attachments[key]" :alt="att.label" />
          </div>
          <span v-if="errors[`att_${key}`]" class="form-error">{{ errors[`att_${key}`] }}</span>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useArticleStore } from '@/stores/article.js'
import { CATEGORIES, ATTACHMENTS_META } from '@/constants/index.js'
import { displayToIso, isoToDisplay, translateToSlug } from '@/utils/index.js'

const props = defineProps({
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['clearError'])

const store = useArticleStore()
const { meta, markDirty } = store

const dateIso = computed(() => displayToIso(meta.date))

const slugLoading = ref(false)
const slugError = ref('')

async function generateSlug() {
  if (!meta.name) return
  slugLoading.value = true
  slugError.value = ''
  try {
    meta.code = await translateToSlug(meta.name)
    markDirty()
  } catch (e) {
    slugError.value = `Ошибка перевода: ${e.message}`
  } finally {
    slugLoading.value = false
  }
}

function onDatePick(e) {
  meta.date = isoToDisplay(e.target.value)
  emit('clearError', 'date')
  markDirty()
}

function clearError(key) {
  emit('clearError', key)
}
</script>

<style scoped>
.meta-form {
  display: flex;
  flex-direction: column;
}

.section {
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}

.section:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

.section__title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin: 0 0 14px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.section__hint {
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-muted);
  opacity: 0.7;
}

/* form layout */
.form-row {
  display: flex;
  gap: 10px;
}

.form-row--3 > .form-field {
  flex: 1;
  min-width: 0;
}

.form-field {
  margin-bottom: 12px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.req { color: var(--accent); }
.muted { color: var(--text-muted); font-weight: 400; text-transform: none; letter-spacing: 0; }

.form-input,
.form-select {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text);
  background: var(--bg);
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent);
}

.form-field--error .form-input,
.form-field--error .form-select {
  border-color: var(--danger);
}

.form-error {
  display: block;
  font-size: 11px;
  color: var(--danger);
  margin-top: 3px;
}

/* slug */
.slug-row {
  display: flex;
  gap: 8px;
}

.slug-btn {
  flex-shrink: 0;
  padding: 0 12px;
  height: 33px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.slug-btn:hover:not(:disabled) {
  background: var(--accent);
  color: #fff;
}

.slug-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.slug-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* date */
.date-row {
  display: flex;
  gap: 6px;
}

.date-picker {
  width: 36px;
  padding: 7px 4px;
  flex-shrink: 0;
  cursor: pointer;
  color: transparent;
}

.date-picker::-webkit-calendar-picker-indicator {
  opacity: 0.5;
  cursor: pointer;
  margin: 0;
  padding: 0;
  width: 18px;
}

/* attachments grid — 2 колонки */
.attachments-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
}

/* превью картинки под полем */
.att-thumb {
  margin-top: 5px;
  border-radius: 4px;
  overflow: hidden;
  height: 52px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}

.att-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Tooltip */
.tooltip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-icon {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--border);
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  flex-shrink: 0;
}

.tooltip-text {
  display: none;
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--tooltip-bg);
  color: var(--tooltip-text);
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  padding: 5px 8px;
  border-radius: 5px;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.tooltip-wrap:hover .tooltip-text {
  display: block;
}
</style>
