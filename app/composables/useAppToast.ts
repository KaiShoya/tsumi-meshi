export const useAppToast = () => {
  const showSuccessToast = (message: string) => {
    // TODO: Implement with NuxtUI toast
    console.log('Success:', message)
  }

  const showDangerToast = (message: string) => {
    // TODO: Implement with NuxtUI toast
    console.error('Error:', message)
  }

  const showInfoToast = (message: string) => {
    // TODO: Implement with NuxtUI toast
    console.log('Info:', message)
  }

  const showWarningToast = (message: string) => {
    // TODO: Implement with NuxtUI toast
    console.warn('Warning:', message)
  }

  return {
    showSuccessToast,
    showDangerToast,
    showInfoToast,
    showWarningToast
  }
}
