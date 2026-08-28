import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { uuid, deepClone } from '@/utils/index.js'
import { CATEGORIES } from '@/constants/index.js'

// --- Фабрики блоков ---

export function makeBlock(type) {
  const base = { _id: uuid(), type, gender: null }
  switch (type) {
    case 'text':
      return { ...base, content: '' }
    case 'image':
      return { ...base, image: { url: '', alt: '', text: '', link: '' } }
    case 'image-slider':
      // items: [{ _id, url, _alt }] — _alt только в UI, в JSON не попадает
      return { ...base, items: [] }
    case 'products-slider':
    case 'products-text':
      return { ...base, products: [] }
    case 'columns':
      return { ...base, items: [[], []] }
    default:
      return base
  }
}

export function makeColumnBlock(type) {
  const base = { _id: uuid(), type }
  switch (type) {
    case 'text':
      return { ...base, content: '' }
    case 'image':
      return { ...base, image: { url: '', alt: '', text: '', link: '' } }
    default:
      return base
  }
}

// --- Сериализация блоков ---

function serializeBlock(block) {
  const { _id, ...rest } = block

  // убираем gender если null
  if (rest.gender === null || rest.gender === undefined) {
    delete rest.gender
  }

  if (rest.type === 'image-slider') {
    // items: [{ _id, url, _alt }] → images: string[]
    rest.images = (rest.items || []).map((item) => item.url).filter(Boolean)
    delete rest.items
    return rest
  }

  if (rest.type === 'columns') {
    // каждая колонка — массив блоков, рекурсивно сериализуем
    rest.items = (rest.items || []).map((col) =>
      col.map((b) => serializeColumnBlock(b))
    )
    return rest
  }

  if (rest.type === 'image') {
    // убираем пустые поля image
    const img = { ...rest.image }
    if (!img.alt) delete img.alt
    if (!img.text) delete img.text
    if (!img.link) delete img.link
    rest.image = img
    return rest
  }

  return rest
}

function serializeColumnBlock(block) {
  const { _id, ...rest } = block
  if (rest.type === 'image') {
    const img = { ...rest.image }
    if (!img.alt) delete img.alt
    if (!img.text) delete img.text
    if (!img.link) delete img.link
    rest.image = img
  }
  return rest
}

// --- Store ---

const DRAFT_KEY = 'blog-constructor-v2-draft'

export const useArticleStore = defineStore('article', () => {
  // Мета статьи
  const meta = ref({
    code: '',
    categoryIndex: 0,
    name: '',
    author: '',
    tag: '',
    date: '',        // dd.mm.yyyy
    attachments: {
      bigImg: '',
      mediumImg: '',
      smallImg: '',
      latestImg: '',
      mainImg: '',
      headerImg: '',
    },
  })

  // Блоки контента
  const blocks = ref([])

  // История удалений для Ctrl+Z
  const deletedHistory = ref([])

  // Дата последнего сохранения черновика
  const draftSavedAt = ref(null)

  // Флаг — есть ли несохранённые изменения (относительно последнего export/copy)
  const isDirty = ref(false)

  // --- Computed ---

  const category = computed(() => CATEGORIES[meta.value.categoryIndex] || CATEGORIES[0])

  const blockCount = computed(() => blocks.value.length)

  // --- Управление блоками ---

  function addBlock(type, insertAfterIndex = null) {
    const block = makeBlock(type)
    if (insertAfterIndex !== null) {
      blocks.value.splice(insertAfterIndex + 1, 0, block)
    } else {
      blocks.value.push(block)
    }
    markDirty()
    return block
  }

  function removeBlock(index) {
    const removed = blocks.value.splice(index, 1)[0]
    // сохраняем в историю для undo (последние 10)
    deletedHistory.value.push({ block: deepClone(removed), index })
    if (deletedHistory.value.length > 10) deletedHistory.value.shift()
    markDirty()
  }

  function duplicateBlock(index) {
    const original = blocks.value[index]
    const clone = deepClone(original)
    clone._id = uuid()
    blocks.value.splice(index + 1, 0, clone)
    markDirty()
  }

  function moveBlock(fromIndex, toIndex) {
    if (fromIndex === toIndex) return
    const [block] = blocks.value.splice(fromIndex, 1)
    blocks.value.splice(toIndex, 0, block)
    markDirty()
  }

  function undoDelete() {
    if (!deletedHistory.value.length) return
    const { block, index } = deletedHistory.value.pop()
    const insertAt = Math.min(index, blocks.value.length)
    blocks.value.splice(insertAt, 0, block)
    markDirty()
  }

  // --- Import / Export ---

  function exportToJson() {
    const cat = category.value
    const result = {
      category: { id: cat.id, code: cat.code, name: cat.name },
      name: meta.value.name,
      tag: meta.value.tag || undefined,
      date: meta.value.date,
      attachments: { ...meta.value.attachments },
    }

    if (meta.value.author) result.author = meta.value.author

    // убираем undefined поля из attachments
    Object.keys(result.attachments).forEach((k) => {
      if (!result.attachments[k]) delete result.attachments[k]
    })

    result.content = blocks.value.map(serializeBlock)

    // убираем верхнеуровневые undefined
    Object.keys(result).forEach((k) => {
      if (result[k] === undefined) delete result[k]
    })

    isDirty.value = false
    return JSON.stringify(result, null, 2)
  }

  function importFromJson(jsonString) {
    const data = JSON.parse(jsonString)

    // мета
    meta.value.name = data.name ?? ''
    meta.value.author = data.author ?? ''
    meta.value.tag = data.tag ?? ''
    meta.value.date = data.date ?? ''
    meta.value.attachments = {
      bigImg: data.attachments?.bigImg ?? '',
      mediumImg: data.attachments?.mediumImg ?? '',
      smallImg: data.attachments?.smallImg ?? '',
      latestImg: data.attachments?.latestImg ?? '',
      mainImg: data.attachments?.mainImg ?? '',
      headerImg: data.attachments?.headerImg ?? '',
    }

    // категория
    const catIndex = CATEGORIES.findIndex(
      (c) => c.id === data.category?.id || c.name === data.category?.name
    )
    meta.value.categoryIndex = catIndex >= 0 ? catIndex : 0

    // блоки
    blocks.value = (data.content || []).map(deserializeBlock)
    isDirty.value = false
  }

  function deserializeBlock(raw) {
    const block = { _id: uuid(), ...deepClone(raw) }

    if (!('gender' in block)) block.gender = null

    if (block.type === 'image-slider') {
      // images: string[] → items: [{ _id, url, _alt }]
      block.items = (block.images || []).map((url) => ({ _id: uuid(), url, _alt: '' }))
      delete block.images
    }

    if (block.type === 'columns') {
      block.items = (block.items || []).map((col) =>
        col.map((b) => ({ _id: uuid(), gender: null, ...deepClone(b) }))
      )
    }

    return block
  }

  // --- Черновик (localStorage) ---

  function saveDraft() {
    try {
      const draft = {
        meta: deepClone(meta.value),
        blocks: deepClone(blocks.value),
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      draftSavedAt.value = draft.savedAt
    } catch (e) {
      console.warn('Не удалось сохранить черновик:', e)
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return null
      const draft = JSON.parse(raw)

      // Патчим поля мета по одному — не заменяем объект целиком,
      // иначе компоненты теряют реактивную ссылку
      const m = draft.meta || {}
      meta.value.code = m.code ?? ''
      meta.value.categoryIndex = m.categoryIndex ?? 0
      meta.value.name = m.name ?? ''
      meta.value.author = m.author ?? ''
      meta.value.tag = m.tag ?? ''
      meta.value.date = m.date ?? ''
      meta.value.attachments.bigImg = m.attachments?.bigImg ?? ''
      meta.value.attachments.mediumImg = m.attachments?.mediumImg ?? ''
      meta.value.attachments.smallImg = m.attachments?.smallImg ?? ''
      meta.value.attachments.latestImg = m.attachments?.latestImg ?? ''
      meta.value.attachments.mainImg = m.attachments?.mainImg ?? ''
      meta.value.attachments.headerImg = m.attachments?.headerImg ?? ''

      blocks.value = draft.blocks || []
      draftSavedAt.value = draft.savedAt
      return draft.savedAt
    } catch (e) {
      console.warn('Не удалось загрузить черновик:', e)
      return null
    }
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
    draftSavedAt.value = null
    resetAll()
  }

  function hasDraft() {
    return !!localStorage.getItem(DRAFT_KEY)
  }

  function resetAll() {
    meta.value.code = ''
    meta.value.categoryIndex = 0
    meta.value.name = ''
    meta.value.author = ''
    meta.value.tag = ''
    meta.value.date = ''
    meta.value.attachments.bigImg = ''
    meta.value.attachments.mediumImg = ''
    meta.value.attachments.smallImg = ''
    meta.value.attachments.latestImg = ''
    meta.value.attachments.mainImg = ''
    meta.value.attachments.headerImg = ''
    blocks.value = []
    deletedHistory.value = []
    isDirty.value = false
  }

  function markDirty() {
    isDirty.value = true
  }

  return {
    meta,
    blocks,
    draftSavedAt,
    isDirty,
    deletedHistory,
    category,
    blockCount,
    addBlock,
    removeBlock,
    duplicateBlock,
    moveBlock,
    undoDelete,
    exportToJson,
    importFromJson,
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    resetAll,
    markDirty,
  }
})
