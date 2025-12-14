export const useLogger = () => {
  const error = (message: string, context: Record<string, any>, error?: Error) => {
    // TODO: Implement proper logging (NewRelic integration)
    console.error(message, context, error)
  }

  const info = (message: string, context: Record<string, any>) => {
    console.log(message, context)
  }

  const warn = (message: string, context: Record<string, any>) => {
    console.warn(message, context)
  }

  return {
    error,
    info,
    warn
  }
}
