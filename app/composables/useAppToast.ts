import { useToast as nuxtUseToast } from '@nuxt/ui'

export const useAppToast = () => {
  let add = (_opts?: { description?: string; color?: string }) => {}

  if (typeof nuxtUseToast === 'function') {
    try {
      const t = nuxtUseToast()
      if (t && typeof t.add === 'function') add = t.add.bind(t)
    } catch (e) {
      // noop — tests or environment may not provide NuxtUI
    }
  }

  const showSuccessToast = (message: string) => {
    add({ description: message, color: 'success' })
  }

  const showDangerToast = (message: string) => {
    add({ description: message, color: 'error' })
  }

  const showInfoToast = (message: string) => {
    add({ description: message, color: 'info' })
  }

  const showWarningToast = (message: string) => {
    add({ description: message, color: 'warning' })
  }

  return {
    showSuccessToast,
    showDangerToast,
    showInfoToast,
    showWarningToast
  }
}
