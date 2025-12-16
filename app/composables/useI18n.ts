import { ref, computed, onMounted } from 'vue'
import ja from '../../locales/ja.json'
import en from '../../locales/en.json'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '../../utils/locales'

// Keep runtime checks lightweight to avoid Node-specific globals in browser/SSR/test

const messages: Record<Locale, Record<string, unknown>> = {
  ja,
  en
}

export const useI18n = () => {
  const locale = ref<Locale>(DEFAULT_LOCALE)

  onMounted(() => {
    try {
      // In test environment, keep DEFAULT_LOCALE to avoid depending on JSDOM navigator
      if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.MODE === 'test') return
      const stored = (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') ? window.localStorage.getItem('locale') : null
      if (stored && LOCALES.includes(stored as Locale)) {
        locale.value = stored as Locale
        return
      }

      if (typeof navigator !== 'undefined') {
        if (navigator.languages && navigator.languages.length) {
          const found = navigator.languages
            .map(l => l.split('-')[0])
            .find(l => LOCALES.includes(l as Locale))
          if (found) {
            locale.value = found as Locale
          }
        } else if (navigator.language) {
          const found = navigator.language.split('-')[0]
          if (LOCALES.includes(found as Locale)) {
            locale.value = found as Locale
          }
        }
      }
    } catch (err) {
      // ignore in SSR/test
      void err
    }
  })

  const t = (key: string, fallback?: string) => {
    const parts = key.split('.')
    let node: unknown = messages[locale.value] || {}
    for (const p of parts) {
      if (node && Object.prototype.hasOwnProperty.call(node, p)) {
        node = (node as Record<string, unknown>)[p as string]
      } else {
        return fallback ?? key
      }
    }
    if (typeof node === 'string') return node
    return fallback ?? key
  }

  const setLocale = (l: Locale) => {
    if (!LOCALES.includes(l)) return
    locale.value = l
    try {
      localStorage.setItem('locale', l)
    } catch (err) {
      void err
    }
  }

  return {
    locale: computed(() => locale.value),
    t,
    setLocale
  }
}

export default useI18n
