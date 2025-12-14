// @ts-expect-error: Pinia types may not be available in typecheck environment
import { defineStore } from 'pinia'
import { apiClient } from '~/utils/api/client'

export const useChecksStore = defineStore('checks', () => {
  const checks = ref<Array<{ id: number, createdAt: string }>>([])

  const fetchChecks = async (recipeId: number) => {
    const res = await apiClient.getChecks(recipeId)
    checks.value = (res.checks ?? []) as Array<{ id: number, createdAt: string }>
  }

  return {
    checks: readonly(checks),
    fetchChecks
  }
})
