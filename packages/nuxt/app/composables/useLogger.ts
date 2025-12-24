export const useLogger = () => {
  const error = (message: string, context: Record<string, unknown>, error?: Error) => {
    // If a NewRelic/browser agent or other global logger is present, prefer it.
    try {
      const globalWithNR = globalThis as unknown as { __newrelic?: { noticeError?: (e: Error) => void } }
      const newrelic = globalWithNR.__newrelic
      if (newrelic && typeof newrelic.noticeError === 'function') {
        try {
          newrelic.noticeError(error ?? new Error(message))
        } catch (err) {
          // Log invocation failure for visibility
          console.debug('NewRelic.noticeError failed', err)
        }
      }
    } catch (err) {
      console.debug('Accessing global newrelic failed', err)
    }

    // Always emit to console as a fallback for local/dev
    console.error(message, context, error)
  }

  const info = (message: string, context: Record<string, unknown>) => {
    try {
      const globalWithNR = globalThis as unknown as { __newrelic?: { addPageAction?: (name: string, attrs?: Record<string, unknown>) => void } }
      const newrelic = globalWithNR.__newrelic
      if (newrelic && typeof newrelic.addPageAction === 'function') {
        try {
          newrelic.addPageAction('info', { message, ...context })
        } catch (err) {
          console.debug('NewRelic.addPageAction(info) failed', err)
        }
      }
    } catch (err) {
      console.debug('Accessing global newrelic failed', err)
    }
    console.log(message, context)
  }

  const warn = (message: string, context: Record<string, unknown>) => {
    try {
      const globalWithNR = globalThis as unknown as { __newrelic?: { addPageAction?: (name: string, attrs?: Record<string, unknown>) => void } }
      const newrelic = globalWithNR.__newrelic
      if (newrelic && typeof newrelic.addPageAction === 'function') {
        try {
          newrelic.addPageAction('warn', { message, ...context })
        } catch (err) {
          console.debug('NewRelic.addPageAction(warn) failed', err)
        }
      }
    } catch (err) {
      console.debug('Accessing global newrelic failed', err)
    }
    console.warn(message, context)
  }

  return {
    error,
    info,
    warn
  }
}
