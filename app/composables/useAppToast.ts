export const useAppToast = () => {
  // `apiRef` is registered by the Nuxt plugin or tests via `setAppToast`.
  let apiRef: { add?: (opts?: { description?: string, color?: string }) => void } | undefined
  const queue: Array<{ description?: string, color?: string }> = []

  const setAppToast = (api?: { add?: (opts?: { description?: string, color?: string }) => void }) => {
    apiRef = api
    if (apiRef && typeof apiRef.add === 'function') {
      for (const opts of queue) apiRef.add(opts)
      queue.length = 0
    }
  }

  const showSuccessToast = (message: string) => {
    const opts = { description: message, color: 'success' }
    if (apiRef && typeof apiRef.add === 'function') apiRef.add(opts)
    else queue.push(opts)
  }

  const showDangerToast = (message: string) => {
    const opts = { description: message, color: 'error' }
    if (apiRef && typeof apiRef.add === 'function') apiRef.add(opts)
    else queue.push(opts)
  }

  const showInfoToast = (message: string) => {
    const opts = { description: message, color: 'info' }
    if (apiRef && typeof apiRef.add === 'function') apiRef.add(opts)
    else queue.push(opts)
  }

  const showWarningToast = (message: string) => {
    const opts = { description: message, color: 'warning' }
    if (apiRef && typeof apiRef.add === 'function') apiRef.add(opts)
    else queue.push(opts)
  }

  return { showSuccessToast, showDangerToast, showInfoToast, showWarningToast, setAppToast }
}
