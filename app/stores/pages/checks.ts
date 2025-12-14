// @ts-expect-error: Pinia types may not be available in typecheck environment
import { defineStore } from 'pinia'
import { useChecksStore } from '~/stores/data/checks'
import { apiClient } from '~/utils/api/client'
import { useToast } from '~/composables/useToast'

export const useChecksPageStore = defineStore('checksPage', () => {
  const checksStore = useChecksStore()
  const { showDangerToast } = useToast()
  const logger = useLogger()

  const fetchChecks = async (recipeId: number) => {
    try {
      await checksStore.fetchChecks(recipeId)
    } catch (error) {
      showDangerToast('チェック履歴の読み込みに失敗しました')
      logger.error('Failed to fetch checks', { module: 'checksPage' }, error instanceof Error ? error : undefined)
    }
  }

  const fetchStats = async (period: 'month' | 'week' = 'month') => {
    try {
      const res = await apiClient.getCheckStats(period)
      return res
    } catch (error) {
      showDangerToast('チェック統計の取得に失敗しました')
      logger.error('Failed to fetch check stats', { module: 'checksPage', period }, error instanceof Error ? error : undefined)
      return { totalChecks: 0, periodChecks: 0 }
    }
  }

  return {
    fetchChecks,
    fetchStats
  }
})
