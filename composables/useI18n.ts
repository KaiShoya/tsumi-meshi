import { ref, computed, onMounted } from 'vue'
import ja from '~/locales/ja.json'
import en from '~/locales/en.json'
import { LOCALES, DEFAULT_LOCALE } from '~/utils/locales'

const messages: Record<string, Record<string, any>> = {
  ja,
  en
}

export const useI18n = () => {
  const locale = ref<string>(DEFAULT_LOCALE)

  onMounted(() => {
    try {
      const stored = localStorage.getItem('locale')
      if (stored && LOCALES.includes(stored as any)) {
        locale.value = stored
        return
      }
      if (navigator.languages && navigator.languages.length) {
        const found = navigator.languages.map(l => l.split('-')[0]).find(l => LOCALES.includes(l as any))
        if (found) locale.value = found
      } else if (navigator.language) {
        const found = navigator.language.split('-')[0]
        if (LOCALES.includes(found as any)) locale.value = found
      }
    } catch {
      // ignore in SSR/test
    }
  })

  const t = (key: string, fallback?: string) => {
    const parts = key.split('.')
    let node: any = messages[locale.value] || {}
    for (const p of parts) {
      if (node && Object.prototype.hasOwnProperty.call(node, p)) node = node[p]
      else return fallback ?? key
    }
    if (typeof node === 'string') return node
    return fallback ?? key
  }

  const setLocale = (l: string) => {
    if (!LOCALES.includes(l as any)) return
    locale.value = l
    try { localStorage.setItem('locale', l) } catch {}
  }

  return {
    locale: computed(() => locale.value),
    t,
    setLocale
  }
}

export default useI18n
