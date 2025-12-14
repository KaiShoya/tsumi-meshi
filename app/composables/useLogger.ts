export const useLogger = () => {
  const error = (message: string, context: Record<string, unknown>, error?: Error) => {
    // TODO: Implement proper logging (NewRelic integration)
    console.error(message, context, error)
  }

  const info = (message: string, context: Record<string, unknown>) => {
    console.log(message, context)
  }

  const warn = (message: string, context: Record<string, unknown>) => {
    console.warn(message, context)
  }

  return {
    error,
    info,
    warn
  }
}
