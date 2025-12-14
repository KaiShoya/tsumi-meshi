import nuxtUseToast from '@nuxt/ui'

export const useAppToast = () => {
  let add = (_opts?: { description?: string, color?: string }) => {}

  if (typeof nuxtUseToast === 'function') {
    try {
      type ToastApi = { add?: (opts?: { description?: string, color?: string }) => void }
      const t = (nuxtUseToast as unknown as (...args: unknown[]) => ToastApi)()
      if (t && typeof t.add === 'function') add = t.add.bind(t)
    } catch {
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
