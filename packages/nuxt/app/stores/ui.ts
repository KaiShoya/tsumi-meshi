import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const loading = ref(0)

  const showLoading = () => {
    loading.value += 1
  }

  const hideLoading = () => {
    loading.value = Math.max(0, loading.value - 1)
  }

  return {
    loading: readonly(computed(() => loading.value > 0)),
    showLoading,
    hideLoading
  }
})
