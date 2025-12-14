export const useAppToast = () => {
  let add = (_opts?: { description?: string, color?: string }) => {}
  let inited = false
  const queue: Array<{ description?: string; color?: string }> = []
  let apiRef: { add?: (opts?: { description?: string; color?: string }) => void } | undefined

  const init = async () => {
    if (inited) return
    inited = true
    try {
      const mod = await import('@nuxt/ui')
      const fn = (mod as any).default ?? (mod as any).useToast
      if (typeof fn === 'function') {
        try {
          const api = await (fn as any)()
          if (api && typeof api.add === 'function') {
            apiRef = api
            add = (opts?: { description?: string; color?: string }) => apiRef?.add?.(opts)
          }
        } catch {
          // calling the module function may throw or reject outside Nuxt context — ignore
        }
      } else if (fn && typeof fn.add === 'function') {
        add = fn.add.bind(fn)
      }
      // flush any queued toasts
      if (queue.length > 0 && apiRef && typeof apiRef.add === 'function') {
        for (const opts of queue) apiRef.add(opts)
        queue.length = 0
      }
    } catch {
      // noop — tests or environment may not provide NuxtUI
    }
  }

  const showSuccessToast = (message: string) => {
    add({ description: message, color: 'success' })
    void init()
  }

  const showDangerToast = (message: string) => {
    add({ description: message, color: 'error' })
    void init()
  }

  const showInfoToast = (message: string) => {
    add({ description: message, color: 'info' })
    void init()
  }

  const showWarningToast = (message: string) => {
    add({ description: message, color: 'warning' })
    void init()
  }

  return {
    showSuccessToast,
    showDangerToast,
    showInfoToast,
    showWarningToast
  }
}
