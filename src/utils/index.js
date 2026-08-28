/**
 * Генерирует простой UUID v4
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Конвертирует дату из YYYY-MM-DD (input[type=date]) в dd.mm.yyyy
 */
export function isoToDisplay(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

/**
 * Конвертирует дату из dd.mm.yyyy в YYYY-MM-DD для input[type=date]
 */
export function displayToIso(display) {
  if (!display) return ''
  const parts = display.split('.')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  return `${y}-${m}-${d}`
}

/**
 * Конвертирует строку в slug (латиница, цифры, дефисы)
 */
export function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // оставляем только латиницу, цифры, пробелы, дефисы
    .trim()
    .replace(/[\s-]+/g, '-')         // пробелы и множественные дефисы → один дефис
}

/**
 * Переводит текст через неофициальный Google Translate endpoint (без ключа)
 * и возвращает slug из переведённой строки
 */
export async function translateToSlug(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  // Ответ: [ [ ["translated", "original", ...], ... ], ... ]
  const translated = data?.[0]?.map((chunk) => chunk?.[0]).filter(Boolean).join('')
  if (!translated) throw new Error('Нет перевода в ответе')
  return toSlug(translated)
}

/**
 * Глубокое клонирование объекта
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
